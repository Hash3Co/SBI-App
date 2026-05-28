from rest_framework import serializers
from .models import Course, Chapter, Enrollment, ChapterProgress

class ChapterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chapter
        fields = ['id', 'title', 'order', 'description', 'video_url', 
                  'video_duration', 'has_quiz', 'created_at']


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'title', 'slug', 'description', 'instructor', 'category',
                  'level', 'duration_hours', 'total_chapters', 'thumbnail_url',
                  'price', 'is_published', 'created_at']


class CourseDetailSerializer(serializers.ModelSerializer):
    chapters = ChapterSerializer(many=True, read_only=True)
    
    class Meta:
        model = Course
        fields = '__all__'


class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    
    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'course_title', 'enrolled_at', 'completed_at',
                  'progress_percentage', 'certificate_generated', 'certificate_url']


class ChapterProgressSerializer(serializers.ModelSerializer):
    chapter_title = serializers.CharField(source='chapter.title', read_only=True)
    
    class Meta:
        model = ChapterProgress
        fields = ['id', 'chapter', 'chapter_title', 'is_completed', 'completed_at',
                  'quiz_score', 'quiz_passed']


class QuizSubmitSerializer(serializers.Serializer):
    answers = serializers.ListField(
        child=serializers.IntegerField(),
        required=True
    )


class CertificateSerializer(serializers.Serializer):
    certificate_url = serializers.URLField()
    course_title = serializers.CharField()
    student_name = serializers.CharField()
    completion_date = serializers.DateTimeField()
    score = serializers.IntegerField()