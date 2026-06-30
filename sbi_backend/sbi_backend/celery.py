import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sbi_backend.settings')

app = Celery('sbi_backend')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()


@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')


@app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Update daily metrics at midnight
    sender.add_periodic_task(
        crontab(hour=0, minute=0),
        update_daily_metrics.s(),
    )
    
    # Generate weekly report every Monday at 9 AM
    sender.add_periodic_task(
        crontab(hour=9, minute=0, day_of_week=1),
        generate_weekly_report.s(),
    )
    
    # Generate monthly report on 1st of month at 10 AM
    sender.add_periodic_task(
        crontab(hour=10, minute=0, day_of_month=1),
        generate_monthly_report.s(),
    )
    
    # Clean up old activity logs every Sunday at 2 AM
    sender.add_periodic_task(
        crontab(hour=2, minute=0, day_of_week=0),
        cleanup_old_activities.s(),
    )


@app.task
def update_daily_metrics():
    from apps.analytics.metrics import update_daily_metrics
    update_daily_metrics()
    return "Daily metrics updated"


@app.task
def generate_weekly_report():
    from datetime import datetime, timedelta
    from apps.analytics.metrics import generate_report
    from apps.analytics.models import Report
    
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=7)
    
    report_data = generate_report('weekly', start_date, end_date)
    
    Report.objects.create(
        report_type='weekly',
        title=f"Weekly Report - {start_date} to {end_date}",
        data=report_data,
        period_start=start_date,
        period_end=end_date
    )
    return "Weekly report generated"


@app.task
def generate_monthly_report():
    from datetime import datetime, timedelta
    from apps.analytics.metrics import generate_report
    from apps.analytics.models import Report
    
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=30)
    
    report_data = generate_report('monthly', start_date, end_date)
    
    Report.objects.create(
        report_type='monthly',
        title=f"Monthly Report - {start_date} to {end_date}",
        data=report_data,
        period_start=start_date,
        period_end=end_date
    )
    return "Monthly report generated"


@app.task
def cleanup_old_activities():
    from django.utils import timezone
    from datetime import timedelta
    from apps.analytics.models import UserActivity
    
    # Delete activities older than 90 days
    cutoff_date = timezone.now() - timedelta(days=90)
    deleted = UserActivity.objects.filter(created_at__lt=cutoff_date).delete()
    return f"Deleted {deleted[0]} old activities"