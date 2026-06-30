from django.urls import path
from .views import (
    CourseListView, CourseDetailView, EnrollCourseView,
    ChapterProgressView, SubmitQuizView, CertificateView
)

urlpatterns = [
    path('courses/', CourseListView.as_view(), name='courses'),
    path('courses/<slug:slug>/', CourseDetailView.as_view(), name='course-detail'),
    path('courses/<uuid:course_id>/enroll/', EnrollCourseView.as_view(), name='enroll'),
    path('courses/<uuid:course_id>/chapters/<uuid:chapter_id>/complete/', 
         ChapterProgressView.as_view(), name='complete-chapter'),
    path('courses/<uuid:course_id>/chapters/<uuid:chapter_id>/quiz/', 
         SubmitQuizView.as_view(), name='submit-quiz'),
    path('courses/<uuid:course_id>/certificate/', 
         CertificateView.as_view(), name='certificate'),
]