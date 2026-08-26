# apps/training/admin.py
from django.contrib import admin
from .models import Course, Chapter, Quiz, QuizQuestion, UserProgress, Certificate, QuizResult

class ChapterInline(admin.StackedInline):
    model = Chapter
    extra = 1
    fields = ('title', 'description', 'video_url', 'duration', 'order')

class QuizQuestionInline(admin.StackedInline):
    model = QuizQuestion
    extra = 3
    fields = ('question', 'options', 'correct_answer')

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'category', 'level', 'is_published', 'price', 'created_at')
    list_filter = ('category', 'level', 'is_published')
    search_fields = ('title', 'description', 'instructor')
    readonly_fields = ('id', 'created_at', 'updated_at')
    inlines = [ChapterInline]
    
    fieldsets = (
        ('Course Information', {
            'fields': ('title', 'description', 'category', 'level', 'thumbnail', 'instructor')
        }),
        ('Pricing & Status', {
            'fields': ('price', 'is_published', 'certificate_available')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'course', 'order', 'duration')
    list_filter = ('course',)
    search_fields = ('title', 'description')

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('id', 'chapter', 'passing_score')
    list_filter = ('chapter__course',)
    inlines = [QuizQuestionInline]

@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'quiz', 'question_preview')
    search_fields = ('question',)
    
    def question_preview(self, obj):
        return obj.question[:50] + '...' if len(obj.question) > 50 else obj.question
    question_preview.short_description = 'Question'

@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'progress', 'completed_chapters_count', 'last_accessed')
    list_filter = ('course',)
    search_fields = ('user__email', 'user__full_name', 'course__title')

@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'course', 'issued_at')
    list_filter = ('issued_at', 'course')
    search_fields = ('user__email', 'user__full_name', 'course__title')
    readonly_fields = ('id', 'issued_at')

@admin.register(QuizResult)
class QuizResultAdmin(admin.ModelAdmin):
    list_display = ('user', 'quiz', 'score', 'passed', 'created_at')
    list_filter = ('passed', 'created_at')
    search_fields = ('user__email', 'user__full_name')
    readonly_fields = ('id', 'created_at')