# apps/training/views.py
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Count, Avg
from django.core.cache import cache
from django.utils import timezone
from .models import (
    Course, Chapter, Quiz, QuizQuestion, 
    UserProgress, Certificate, QuizResult
)
from .serializers import (
    CourseSerializer, CourseDetailSerializer,
    ChapterSerializer, QuizSerializer,
    UserProgressSerializer, CertificateSerializer,
    QuizResultSerializer, QuizSubmitSerializer
)
from apps.accounts.models import UserActivity
import logging

logger = logging.getLogger(__name__)

class CourseListView(generics.ListAPIView):
    """List all published courses"""
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
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(instructor__icontains=search)
            )
        
        return queryset.order_by('-created_at')

class CourseDetailView(generics.RetrieveAPIView):
    """Get course details"""
    serializer_class = CourseDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    queryset = Course.objects.all()

class EnrollCourseView(APIView):
    """Enroll in a course"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, id):
        try:
            course = Course.objects.get(id=id, is_published=True)
        except Course.DoesNotExist:
            return Response({
                'error': 'Course not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        progress, created = UserProgress.objects.get_or_create(
            user=request.user,
            course=course,
            defaults={'progress': 0, 'completed_chapters': []}
        )
        
        if created:
            # Log activity
            UserActivity.objects.create(
                user=request.user,
                action='enroll_course',
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT'),
                details={'course_id': str(course.id), 'course_title': course.title}
            )
            
            return Response({
                'message': 'Successfully enrolled in course',
                'progress': progress.progress
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'message': 'Already enrolled',
            'progress': progress.progress
        })

class CourseProgressView(APIView):
    """Get course progress"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, id):
        try:
            course = Course.objects.get(id=id)
        except Course.DoesNotExist:
            return Response({
                'error': 'Course not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        progress = UserProgress.objects.filter(
            user=request.user,
            course=course
        ).first()
        
        if not progress:
            return Response({
                'progress': 0,
                'completed_chapters': 0,
                'total_chapters': course.chapters.count(),
                'is_enrolled': False
            })
        
        return Response({
            'progress': progress.progress,
            'completed_chapters': progress.completed_chapters_count,
            'total_chapters': course.chapters.count(),
            'completed_chapters_list': progress.completed_chapters,
            'is_enrolled': True,
            'last_accessed': progress.last_accessed
        })

class CompleteChapterView(APIView):
    """Mark chapter as complete"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, id):
        try:
            chapter = Chapter.objects.get(id=id)
        except Chapter.DoesNotExist:
            return Response({
                'error': 'Chapter not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        progress, _ = UserProgress.objects.get_or_create(
            user=request.user,
            course=chapter.course
        )
        
        # Add chapter to completed list if not already
        completed = progress.completed_chapters or []
        if str(chapter.id) not in completed:
            completed.append(str(chapter.id))
            progress.completed_chapters = completed
            progress.completed_chapters_count = len(completed)
            
            # Calculate progress
            total_chapters = chapter.course.chapters.count()
            progress.progress = int((len(completed) / total_chapters) * 100) if total_chapters > 0 else 0
            
            # Check if course is complete
            if progress.progress == 100:
                progress.is_completed = True
                progress.completed_at = timezone.now()
                # Create certificate
                Certificate.objects.get_or_create(
                    user=request.user,
                    course=chapter.course
                )
            
            progress.save()
            
            # Log activity
            UserActivity.objects.create(
                user=request.user,
                action='complete_chapter',
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT'),
                details={'chapter_id': str(chapter.id), 'course_id': str(chapter.course.id)}
            )
        
        return Response({
            'message': 'Chapter completed successfully',
            'progress': progress.progress,
            'completed_chapters': progress.completed_chapters_count,
            'total_chapters': chapter.course.chapters.count()
        })

class SubmitQuizView(APIView):
    """Submit quiz answers"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = QuizSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        chapter_id = serializer.validated_data['chapter_id']
        answers = serializer.validated_data['answers']
        
        try:
            chapter = Chapter.objects.get(id=chapter_id)
        except Chapter.DoesNotExist:
            return Response({
                'error': 'Chapter not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if not chapter.quiz:
            return Response({
                'error': 'No quiz for this chapter'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get quiz questions
        questions = QuizQuestion.objects.filter(quiz=chapter.quiz)
        
        # Calculate score
        correct = 0
        total = len(questions)
        
        for i, question in enumerate(questions):
            if i < len(answers) and answers[i] == question.correct_answer:
                correct += 1
        
        score = int((correct / total) * 100) if total > 0 else 0
        passed = score >= chapter.quiz.passing_score
        
        # Save quiz result
        result = QuizResult.objects.create(
            user=request.user,
            quiz=chapter.quiz,
            score=score,
            passed=passed,
            answers=answers,
            total_questions=total,
            correct_answers=correct
        )
        
        # If passed, mark chapter as complete
        if passed:
            self.complete_chapter(request, chapter)
        
        return Response({
            'passed': passed,
            'score': score,
            'total_questions': total,
            'correct_answers': correct,
            'message': 'Quiz passed!' if passed else 'Quiz failed. Please review the chapter.'
        })
    
    def complete_chapter(self, request, chapter):
        progress, _ = UserProgress.objects.get_or_create(
            user=request.user,
            course=chapter.course
        )
        
        completed = progress.completed_chapters or []
        if str(chapter.id) not in completed:
            completed.append(str(chapter.id))
            progress.completed_chapters = completed
            progress.completed_chapters_count = len(completed)
            
            total_chapters = chapter.course.chapters.count()
            progress.progress = int((len(completed) / total_chapters) * 100) if total_chapters > 0 else 0
            
            if progress.progress == 100:
                progress.is_completed = True
                progress.completed_at = timezone.now()
                Certificate.objects.get_or_create(
                    user=request.user,
                    course=chapter.course
                )
            
            progress.save()

class CertificateView(APIView):
    """Get course certificate"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, course_id):
        try:
            certificate = Certificate.objects.get(
                user=request.user,
                course_id=course_id
            )
            
            return Response({
                'id': certificate.id,
                'user': {
                    'full_name': request.user.full_name,
                    'email': request.user.email
                },
                'course': {
                    'id': certificate.course.id,
                    'title': certificate.course.title
                },
                'certificate_url': certificate.certificate_url,
                'certificate_code': certificate.certificate_code,
                'issued_at': certificate.issued_at
            })
        except Certificate.DoesNotExist:
            return Response({
                'error': 'Certificate not found. Complete the course first.'
            }, status=status.HTTP_404_NOT_FOUND)

class UserProgressListView(generics.ListAPIView):
    """Get user's progress across all courses"""
    serializer_class = UserProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserProgress.objects.filter(user=self.request.user)

class QuizResultListView(generics.ListAPIView):
    """Get quiz results"""
    serializer_class = QuizResultSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return QuizResult.objects.filter(user=self.request.user)

class RecommendedCoursesView(APIView):
    """Get recommended courses"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get user's enrolled courses
        enrolled = UserProgress.objects.filter(user=user).values_list('course_id', flat=True)
        
        # Get recommendations based on user's role and preferences
        if user.role == 'sme':
            # For SME, recommend based on industry
            try:
                sme = user.sme_profile.first()
                if sme and sme.industry:
                    recommendations = Course.objects.filter(
                        is_published=True,
                        category=sme.industry
                    ).exclude(
                        id__in=enrolled
                    )[:6]
                    
                    # If not enough, add more courses
                    if recommendations.count() < 6:
                        extra = Course.objects.filter(
                            is_published=True
                        ).exclude(
                            id__in=enrolled
                        ).exclude(
                            id__in=recommendations.values_list('id', flat=True)
                        )[:6 - recommendations.count()]
                        recommendations = list(recommendations) + list(extra)
                    
                    return Response(CourseSerializer(recommendations, many=True, context={'request': request}).data)
            except:
                pass
        
        # Default recommendations
        recommendations = Course.objects.filter(is_published=True).exclude(id__in=enrolled)[:6]
        
        return Response(CourseSerializer(recommendations, many=True, context={'request': request}).data)

class CourseCategoriesView(APIView):
    """Get all course categories"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        categories = Course.objects.filter(is_published=True).values_list('category', flat=True).distinct()
        return Response({
            'categories': list(categories)
        })