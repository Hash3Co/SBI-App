# apps/training/models.py
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class Course(models.Model):
    """Training course model"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    instructor = models.CharField(max_length=255)
    
    category = models.CharField(max_length=100)
    LEVEL_CHOICES = (
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Advanced', 'Advanced'),
    )
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='Beginner')
    
    duration = models.CharField(max_length=50)
    thumbnail = models.ImageField(upload_to='courses/', blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    is_published = models.BooleanField(default=False)
    certificate_available = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'training_courses'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title

class Chapter(models.Model):
    """Course chapter model"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='chapters')
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    video_url = models.URLField()
    duration = models.CharField(max_length=50)
    order = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'training_chapters'
        ordering = ['order']
    
    def __str__(self):
        return f"{self.course.title} - {self.title}"

class Quiz(models.Model):
    """Quiz for a chapter"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    chapter = models.OneToOneField(Chapter, on_delete=models.CASCADE, related_name='quiz')
    
    passing_score = models.IntegerField(default=70, validators=[MinValueValidator(0), MaxValueValidator(100)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'training_quizzes'
    
    def __str__(self):
        return f"Quiz for {self.chapter.title}"

class QuizQuestion(models.Model):
    """Quiz question model"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    
    question = models.TextField()
    options = models.JSONField(default=list)  # List of options
    correct_answer = models.IntegerField()  # Index of correct option
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'training_quiz_questions'
    
    def __str__(self):
        return self.question[:50]

class UserProgress(models.Model):
    """User progress tracking for courses"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='training_progress')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='user_progress')
    
    progress = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    completed_chapters = models.JSONField(default=list)  # List of chapter IDs
    completed_chapters_count = models.IntegerField(default=0)
    last_accessed = models.DateTimeField(auto_now=True)
    
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'training_user_progress'
        unique_together = ['user', 'course']
    
    def __str__(self):
        return f"{self.user.email} - {self.course.title} - {self.progress}%"
    
    def update_progress(self):
        """Update progress based on completed chapters"""
        total_chapters = self.course.chapters.count()
        if total_chapters > 0:
            self.progress = int((self.completed_chapters_count / total_chapters) * 100)
        else:
            self.progress = 0
        
        if self.progress == 100 and not self.is_completed:
            self.is_completed = True
            self.completed_at = timezone.now()
        
        self.save()

class Certificate(models.Model):
    """Course completion certificate"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='training_certificates')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='certificates')
    
    certificate_url = models.URLField(blank=True, null=True)
    certificate_code = models.CharField(max_length=50, unique=True, null=True, blank=True)
    issued_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'training_certificates'
        unique_together = ['user', 'course']
    
    def __str__(self):
        return f"{self.user.email} - {self.course.title}"

class QuizResult(models.Model):
    """Quiz attempt results"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='quiz_results')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='results')
    
    score = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    passed = models.BooleanField(default=False)
    answers = models.JSONField(default=list)  # User's answers
    total_questions = models.IntegerField(default=0)
    correct_answers = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'training_quiz_results'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.quiz.chapter.title} - {self.score}%"