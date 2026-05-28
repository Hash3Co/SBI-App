from django.urls import path
from .views import (
    SMEAnalyticsView, InvestorAnalyticsView, PlatformAnalyticsView,
    ImpactMetricsSummaryView, ReportGenerateView, ReportDownloadView
)

urlpatterns = [
    path('sme/', SMEAnalyticsView.as_view(), name='sme-analytics'),
    path('investor/', InvestorAnalyticsView.as_view(), name='investor-analytics'),
    path('platform/', PlatformAnalyticsView.as_view(), name='platform-analytics'),
    path('impact/', ImpactMetricsSummaryView.as_view(), name='impact-metrics'),
    path('report/generate/', ReportGenerateView.as_view(), name='report-generate'),
    path('report/download/<uuid:report_id>/', ReportDownloadView.as_view(), name='report-download'),
]