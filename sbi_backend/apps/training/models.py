# apps/training/models.py
from django.db import models
from django.conf import settings
import uuid

class Course(models.Model):
    """Training course"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    instructor = models.CharField(max_length=255)
    
    CATEGORY_CHOICES = (
        ('business', 'Business Planning'),
        ('finance', 'Financial Literacy'),
        ('pitching', 'Pitch Perfect'),
        ('marketing', 'Marketing'),
        ('legal', 'Legal Compliance'),
    )
    
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    level = models.CharField(max_length=20, choices=(
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ))
    
    duration_hours = models.IntegerField()
    total_chapters = models.IntegerField()
    
    thumbnail_url = models.URLField()
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'courses'
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['category']),
            models.Index(fields=['is_published']),
        ]
    
    def __str__(self):
        return self.title


class Chapter(models.Model):
    """Course chapter"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='chapters')
    title = models.CharField(max_length=255)
    order = models.IntegerField()
    description = models.TextField(blank=True)
    video_url = models.URLField()
    video_duration = models.IntegerField()  # Seconds
    has_quiz = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'chapters'
        ordering = ['order']
        unique_together = [['course', 'order']]
    
    def __str__(self):
        return f"{self.course.title} - Chapter {self.order}: {self.title}"


class Quiz(models.Model):
    """Quiz for a chapter"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    chapter = models.OneToOneField(Chapter, on_delete=models.CASCADE, related_name='quiz')
    passing_score = models.IntegerField(default=70)  # Percentage
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'quizzes'


class Question(models.Model):
    """Quiz question"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    order = models.IntegerField()
    points = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'questions'
        ordering = ['order']


class Option(models.Model):
    """Question option (multiple choice)"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)
    order = models.IntegerField()
    
    class Meta:
        db_table = 'options'
        ordering = ['order']


class Enrollment(models.Model):
    """User course enrollment"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    progress_percentage = models.IntegerField(default=0)
    certificate_generated = models.BooleanField(default=False)
    certificate_url = models.URLField(blank=True, null=True)
    
    class Meta:
        db_table = 'enrollments'
        unique_together = [['user', 'course']]
        indexes = [
            models.Index(fields=['user', 'progress_percentage']),
            models.Index(fields=['completed_at']),
        ]


class ChapterProgress(models.Model):
    """Track progress through chapters"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='chapter_progress')
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(blank=True, null=True)
    quiz_score = models.IntegerField(blank=True, null=True)
    quiz_passed = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'chapter_progress'
        unique_together = [['enrollment', 'chapter']]