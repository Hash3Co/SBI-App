from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction, models
from django.core.cache import cache
from django.utils import timezone

from .models import Course, Enrollment, ChapterProgress, Quiz, Question
from .serializers import (
    CourseSerializer, CourseDetailSerializer, EnrollmentSerializer,
    ChapterProgressSerializer, QuizSubmitSerializer, CertificateSerializer
)
from apps.accounts.permissions import IsSME, IsInvestor
from .services import calculate_readiness_score, generate_certificate


class CourseListView(generics.ListAPIView):
    """List all available courses"""
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Course.objects.filter(is_published=True)
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by level
        level = self.request.query_params.get('level')
        if level:
            queryset = queryset.filter(level=level)
        
        return queryset


class CourseDetailView(generics.RetrieveAPIView):
    """Get course details with user progress"""
    serializer_class = CourseDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'slug'
    queryset = Course.objects.filter(is_published=True)
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        # Add user enrollment status
        try:
            enrollment = Enrollment.objects.get(
                user=request.user,
                course=instance
            )
            data['is_enrolled'] = True
            data['progress_percentage'] = enrollment.progress_percentage
            data['completed_at'] = enrollment.completed_at
        except Enrollment.DoesNotExist:
            data['is_enrolled'] = False
            data['progress_percentage'] = 0
        
        return Response(data)


class EnrollCourseView(APIView):
    """Enroll user in a course"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id, is_published=True)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=404)
        
        enrollment, created = Enrollment.objects.get_or_create(
            user=request.user,
            course=course,
            defaults={'enrolled_at': timezone.now()}
        )
        
        if not created:
            return Response({'message': 'Already enrolled'}, status=200)
        
        return Response({
            'message': 'Successfully enrolled',
            'enrollment_id': str(enrollment.id)
        }, status=201)


class ChapterProgressView(APIView):
    """Mark chapter as completed"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, course_id, chapter_id):
        try:
            enrollment = Enrollment.objects.get(
                user=request.user,
                course_id=course_id
            )
            chapter = enrollment.course.chapters.get(id=chapter_id)
        except (Enrollment.DoesNotExist, Chapter.DoesNotExist):
            return Response({'error': 'Invalid enrollment or chapter'}, status=404)
        
        progress, created = ChapterProgress.objects.get_or_create(
            enrollment=enrollment,
            chapter=chapter,
            defaults={'completed_at': timezone.now() if chapter.has_quiz else timezone.now()}
        )
        
        if not progress.is_completed:
            progress.is_completed = True
            progress.completed_at = timezone.now()
            progress.save()
        
        # Update enrollment progress
        total_chapters = enrollment.course.total_chapters
        completed_chapters = enrollment.chapter_progress.filter(is_completed=True).count()
        progress_percentage = int((completed_chapters / total_chapters) * 100) if total_chapters > 0 else 0
        
        enrollment.progress_percentage = progress_percentage
        
        if progress_percentage == 100 and not enrollment.completed_at:
            enrollment.completed_at = timezone.now()
            # Update readiness score
            from sme.models import SMEProfile
            try:
                sme_profile = SMEProfile.objects.get(user=request.user)
                new_score = calculate_readiness_score(sme_profile)
                sme_profile.readiness_score = new_score['overall_score']
                sme_profile.save()
            except SMEProfile.DoesNotExist:
                pass
        
        enrollment.save()
        
        # Generate certificate if course completed
        if progress_percentage == 100 and not enrollment.certificate_generated:
            certificate_url = generate_certificate_pdf(enrollment)
            enrollment.certificate_generated = True
            enrollment.certificate_url = certificate_url
            enrollment.save()
        
        return Response({
            'progress_percentage': progress_percentage,
            'chapter_completed': True
        })


class SubmitQuizView(APIView):
    """Submit quiz answers and calculate score"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, course_id, chapter_id):
        serializer = QuizSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            enrollment = Enrollment.objects.get(
                user=request.user,
                course_id=course_id
            )
            chapter = enrollment.course.chapters.get(id=chapter_id)
            quiz = chapter.quiz
        except (Enrollment.DoesNotExist, Chapter.DoesNotExist, Quiz.DoesNotExist):
            return Response({'error': 'Invalid quiz'}, status=404)
        
        answers = serializer.validated_data['answers']
        
        # Calculate score - validate against Option model, not non-existent field
        questions = list(Question.objects.filter(quiz=quiz).order_by('id'))
        total_questions = len(questions)
        correct_answers = 0
        
        for idx, answer_id in enumerate(answers):
            if idx >= total_questions:
                break
            question = questions[idx]
            # Check against correct option, not non-existent question field
            try:
                correct_option = question.options.get(is_correct=True)
                if str(answer_id) == str(correct_option.id):
                    correct_answers += 1
            except Exception:
                pass  # Skip if no correct option found
        
        score = int((correct_answers / total_questions) * 100) if total_questions > 0 else 0
        passed = score >= quiz.passing_score
        
        # Save quiz result
        progress, _ = ChapterProgress.objects.get_or_create(
            enrollment=enrollment,
            chapter=chapter
        )
        progress.quiz_score = score
        progress.quiz_passed = passed
        progress.save()
        
        # If passed and chapter not completed, mark completed
        if passed and not progress.is_completed:
            progress.is_completed = True
            progress.completed_at = timezone.now()
            progress.save()
            
            # Update enrollment progress
            total_chapters = enrollment.course.total_chapters
            completed_chapters = enrollment.chapter_progress.filter(is_completed=True).count()
            progress_percentage = int((completed_chapters / total_chapters) * 100) if total_chapters > 0 else 0
            enrollment.progress_percentage = progress_percentage
            enrollment.save()
        
        return Response({
            'score': score,
            'passed': passed,
            'passing_score': quiz.passing_score,
            'correct_answers': correct_answers,
            'total_questions': total_questions
        })


class CertificateView(generics.GenericAPIView):
    """Get course completion certificate"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, course_id):
        try:
            enrollment = Enrollment.objects.get(
                user=request.user,
                course_id=course_id,
                completed_at__isnull=False
            )
        except Enrollment.DoesNotExist:
            return Response({'error': 'Course not completed'}, status=404)
        
        if not enrollment.certificate_generated:
            certificate_url = generate_certificate(enrollment)
            enrollment.certificate_url = certificate_url
            enrollment.certificate_generated = True
            enrollment.save()
        
        serializer = CertificateSerializer({
            'certificate_url': enrollment.certificate_url,
            'course_title': enrollment.course.title,
            'student_name': request.user.get_full_name(),
            'completion_date': enrollment.completed_at,
            'score': enrollment.chapter_progress.aggregate(avg_score=models.Avg('quiz_score'))['avg_score'] or 0
        })
        
        return Response(serializer.data)