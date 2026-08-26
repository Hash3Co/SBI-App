# apps/training/serializers.py
from rest_framework import serializers
from .models import (
    Course, Chapter, Quiz, QuizQuestion, 
    UserProgress, Certificate, QuizResult
)

class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = ('id', 'question', 'options', 'correct_answer')
        read_only_fields = ('id',)

class QuizSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)
    question_count = serializers.IntegerField(source='questions.count', read_only=True)
    
    class Meta:
        model = Quiz
        fields = ('id', 'chapter', 'passing_score', 'questions', 'question_count', 'created_at')
        read_only_fields = ('id', 'created_at')

class ChapterSerializer(serializers.ModelSerializer):
    quiz = QuizSerializer(read_only=True)
    is_completed = serializers.SerializerMethodField()
    
    class Meta:
        model = Chapter
        fields = ('id', 'title', 'description', 'video_url', 'duration', 'order', 
                  'quiz', 'is_completed', 'created_at')
        read_only_fields = ('id', 'created_at')
    
    def get_is_completed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            progress = UserProgress.objects.filter(
                user=request.user,
                course=obj.course
            ).first()
            if progress and obj.id in progress.completed_chapters:
                return True
        return False

class CourseSerializer(serializers.ModelSerializer):
    chapters_count = serializers.IntegerField(source='chapters.count', read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = ('id', 'title', 'description', 'instructor', 'category', 'level', 
                  'duration', 'thumbnail', 'price', 'is_published', 'certificate_available',
                  'chapters_count', 'is_enrolled', 'progress', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserProgress.objects.filter(user=request.user, course=obj).exists()
        return False
    
    def get_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            progress = UserProgress.objects.filter(user=request.user, course=obj).first()
            return progress.progress if progress else 0
        return 0

class CourseDetailSerializer(CourseSerializer):
    chapters = ChapterSerializer(many=True, read_only=True)
    
    class Meta(CourseSerializer.Meta):
        fields = CourseSerializer.Meta.fields + ('chapters',)

class UserProgressSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = UserProgress
        fields = ('id', 'user', 'user_name', 'course', 'progress', 'completed_chapters',
                  'completed_chapters_count', 'is_completed', 'completed_at', 
                  'last_accessed', 'created_at')
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')

class CertificateSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    
    class Meta:
        model = Certificate
        fields = ('id', 'user', 'user_name', 'course', 'course_title', 
                  'certificate_url', 'certificate_code', 'issued_at')
        read_only_fields = ('id', 'issued_at')

class QuizResultSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    quiz_title = serializers.CharField(source='quiz.chapter.title', read_only=True)
    course_title = serializers.CharField(source='quiz.chapter.course.title', read_only=True)
    
    class Meta:
        model = QuizResult
        fields = ('id', 'user', 'user_name', 'quiz', 'quiz_title', 'course_title',
                  'score', 'passed', 'answers', 'total_questions', 'correct_answers', 
                  'created_at')
        read_only_fields = ('id', 'created_at')

class QuizSubmitSerializer(serializers.Serializer):
    chapter_id = serializers.UUIDField(required=True)
    answers = serializers.ListField(child=serializers.IntegerField(), required=True)