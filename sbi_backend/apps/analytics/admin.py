from django.contrib import admin
from .models import PlatformMetric, UserActivity, ImpactMetric, Report

@admin.register(PlatformMetric)
class PlatformMetricAdmin(admin.ModelAdmin):
    list_display = ('metric_type', 'value', 'date', 'created_at')
    list_filter = ('metric_type', 'date')
    search_fields = ('metric_type',)
    readonly_fields = ('id', 'created_at')
    
    fieldsets = (
        ('Metric Information', {
            'fields': ('metric_type', 'value', 'date')
        }),
        ('Additional Data', {
            'fields': ('metadata',)
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        }),
    )
    
    actions = ['recalculate_metrics']
    
    def recalculate_metrics(self, request, queryset):
        from .metrics import calculate_platform_metrics
        for metric in queryset:
            new_value = calculate_platform_metrics(metric.metric_type, metric.date)
            metric.value = new_value
            metric.save()
        self.message_user(request, f'{queryset.count()} metrics recalculated.')
    recalculate_metrics.short_description = "Recalculate selected metrics"


@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    list_display = ('user', 'activity_type', 'created_at', 'ip_address')
    list_filter = ('activity_type', 'created_at')
    search_fields = ('user__email', 'activity_type', 'ip_address')
    readonly_fields = ('id', 'user', 'activity_type', 'details', 'ip_address', 'user_agent', 'created_at')
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False


@admin.register(ImpactMetric)
class ImpactMetricAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'value', 'unit', 'date')
    list_filter = ('category', 'date')
    search_fields = ('name', 'source')
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Impact Information', {
            'fields': ('category', 'name', 'value', 'unit', 'date')
        }),
        ('Source & Metadata', {
            'fields': ('source', 'metadata')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    actions = ['export_to_csv']
    
    def export_to_csv(self, request, queryset):
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="impact_metrics.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Name', 'Category', 'Value', 'Unit', 'Date', 'Source'])
        
        for metric in queryset:
            writer.writerow([metric.name, metric.category, metric.value, metric.unit, metric.date, metric.source])
        
        return response
    export_to_csv.short_description = "Export to CSV"


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'report_type', 'generated_by', 'generated_at', 'period_start', 'period_end')
    list_filter = ('report_type', 'generated_at')
    search_fields = ('title', 'description')
    readonly_fields = ('id', 'generated_at', 'data')
    
    fieldsets = (
        ('Report Information', {
            'fields': ('report_type', 'title', 'description')
        }),
        ('Period', {
            'fields': ('period_start', 'period_end')
        }),
        ('Data', {
            'fields': ('data', 'file_url')
        }),
        ('Generation', {
            'fields': ('generated_by', 'generated_at')
        }),
    )
    
    actions = ['regenerate_report']
    
    def regenerate_report(self, request, queryset):
        from .metrics import generate_report
        for report in queryset:
            new_data = generate_report(report.report_type, report.period_start, report.period_end)
            report.data = new_data
            report.save()
        self.message_user(request, f'{queryset.count()} reports regenerated.')
    regenerate_report.short_description = "Regenerate selected reports"