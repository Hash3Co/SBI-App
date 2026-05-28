from django.contrib import admin
from .models import Course, Chapter, Quiz, Question, Option, Enrollment, ChapterProgress

class ChapterInline(admin.TabularInline):
    model = Chapter
    extra = 1
    fields = ('title', 'order', 'video_url', 'video_duration', 'has_quiz')


class QuizInline(admin.StackedInline):
    model = Quiz
    extra = 0


class OptionInline(admin.TabularInline):
    model = Option
    extra = 4
    fields = ('text', 'is_correct', 'order')


class QuestionInline(admin.StackedInline):
    model = Question
    extra = 1
    fields = ('text', 'order', 'points')
    inlines = [OptionInline]


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'level', 'duration_hours', 'price', 'is_published', 'created_at')
    list_filter = ('category', 'level', 'is_published', 'created_at')
    search_fields = ('title', 'instructor', 'description')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('id', 'created_at', 'updated_at')
    inlines = [ChapterInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'description', 'instructor')
        }),
        ('Classification', {
            'fields': ('category', 'level')
        }),
        ('Course Details', {
            'fields': ('duration_hours', 'total_chapters', 'thumbnail_url', 'price')
        }),
        ('Status', {
            'fields': ('is_published', 'published_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    actions = ['publish_courses', 'unpublish_courses']
    
    def publish_courses(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(is_published=True, published_at=timezone.now())
        self.message_user(request, f'{updated} courses published.')
    publish_courses.short_description = "Publish selected courses"
    
    def unpublish_courses(self, request, queryset):
        updated = queryset.update(is_published=False, published_at=None)
        self.message_user(request, f'{updated} courses unpublished.')
    unpublish_courses.short_description = "Unpublish selected courses"


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order', 'video_duration', 'has_quiz')
    list_filter = ('has_quiz', 'course')
    search_fields = ('title', 'course__title')
    readonly_fields = ('id', 'created_at')
    
    actions = ['enable_quizzes', 'disable_quizzes']
    
    def enable_quizzes(self, request, queryset):
        updated = queryset.update(has_quiz=True)
        for chapter in queryset:
            Quiz.objects.get_or_create(chapter=chapter)
        self.message_user(request, f'{updated} chapters updated with quizzes.')
    enable_quizzes.short_description = "Enable quizzes for chapters"
    
    def disable_quizzes(self, request, queryset):
        updated = queryset.update(has_quiz=False)
        Quiz.objects.filter(chapter__in=queryset).delete()
        self.message_user(request, f'{updated} chapters updated without quizzes.')
    disable_quizzes.short_description = "Disable quizzes for chapters"


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('chapter', 'passing_score', 'questions_count', 'created_at')
    list_filter = ('passing_score',)
    search_fields = ('chapter__title', 'chapter__course__title')
    readonly_fields = ('id', 'created_at')
    inlines = [QuestionInline]
    
    def questions_count(self, obj):
        return obj.questions.count()
    questions_count.short_description = 'Questions'


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('text_preview', 'quiz', 'order', 'points')
    list_filter = ('quiz__chapter__course',)
    search_fields = ('text',)
    readonly_fields = ('id', 'created_at')
    inlines = [OptionInline]
    
    def text_preview(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    text_preview.short_description = 'Question'


@admin.register(Option)
class OptionAdmin(admin.ModelAdmin):
    list_display = ('text_preview', 'question', 'is_correct', 'order')
    list_filter = ('is_correct',)
    search_fields = ('text',)
    
    def text_preview(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    text_preview.short_description = 'Option'


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'progress_percentage', 'enrolled_at', 'completed_at', 'certificate_generated')
    list_filter = ('certificate_generated', 'enrolled_at', 'completed_at')
    search_fields = ('user__email', 'course__title')
    readonly_fields = ('id', 'enrolled_at', 'completed_at')
    
    actions = ['generate_certificates']
    
    def generate_certificates(self, request, queryset):
        from .services import generate_certificate_pdf
        for enrollment in queryset.filter(progress_percentage=100, certificate_generated=False):
            certificate_url = generate_certificate_pdf(enrollment)
            enrollment.certificate_url = certificate_url
            enrollment.certificate_generated = True
            enrollment.save()
        self.message_user(request, f'Certificates generated for {queryset.count()} enrollments.')
    generate_certificates.short_description = "Generate certificates for completed courses"


@admin.register(ChapterProgress)
class ChapterProgressAdmin(admin.ModelAdmin):
    list_display = ('enrollment', 'chapter', 'is_completed', 'quiz_passed', 'quiz_score', 'completed_at')
    list_filter = ('is_completed', 'quiz_passed')
    search_fields = ('enrollment__user__email', 'chapter__title')
    readonly_fields = ('id', 'completed_at')