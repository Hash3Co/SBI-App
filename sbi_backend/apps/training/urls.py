# apps/training/urls.py
from django.urls import path
from .views import (
    CourseListView,
    CourseDetailView,
    EnrollCourseView,
    CourseProgressView,
    CompleteChapterView,
    SubmitQuizView,
    CertificateView,
    UserProgressListView,
    QuizResultListView,
    RecommendedCoursesView,
    CourseCategoriesView,
    EnrolledCoursesView,
)

urlpatterns = [
    # Courses
    path('courses/', CourseListView.as_view(), name='courses'),
    path('courses/recommended/', RecommendedCoursesView.as_view(), name='recommended_courses'),
    path('courses/categories/', CourseCategoriesView.as_view(), name='course_categories'),
    path('courses/enrolled/', EnrolledCoursesView.as_view(), name='enrolled_courses'),
    path('courses/<uuid:id>/progress/', CourseProgressView.as_view(), name='course_progress'),
    path('courses/<uuid:id>/', CourseDetailView.as_view(), name='course_detail'),
    path('courses/<uuid:id>/enroll/', EnrollCourseView.as_view(), name='enroll_course'),
    path('courses/<uuid:id>/progress/', CourseProgressView.as_view(), name='course_progress'),
    
    # Chapters
    path('chapters/<uuid:id>/complete/', CompleteChapterView.as_view(), name='complete_chapter'),
    
    # Quizzes
    path('quiz/submit/', SubmitQuizView.as_view(), name='submit_quiz'),
    path('quiz/results/', QuizResultListView.as_view(), name='quiz_results'),
    
    # Certificates
    path('certificate/<uuid:course_id>/', CertificateView.as_view(), name='certificate'),
    
    # Progress
    path('progress/', UserProgressListView.as_view(), name='user_progress'),
]