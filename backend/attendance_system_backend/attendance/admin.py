from django.contrib import admin
from attendance.models import AttendanceRecord, AttendanceLog, QRCode

class AttendanceLogInline(admin.TabularInline):
    model = AttendanceLog
    extra = 0
    readonly_fields = ('timestamp', 'log_type', 'description', 'location_data', 'qr_data')

@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'status', 'check_in_time', 'check_out_time', 'qr_verified', 'geo_verified', 'face_verified')
    list_filter = ('date', 'status', 'qr_verified', 'geo_verified', 'face_verified')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name')
    date_hierarchy = 'date'
    inlines = [AttendanceLogInline]

@admin.register(AttendanceLog)
class AttendanceLogAdmin(admin.ModelAdmin):
    list_display = ('attendance_record', 'log_type', 'timestamp', 'description')
    list_filter = ('log_type', 'timestamp')
    search_fields = ('attendance_record__user__username', 'description')
    date_hierarchy = 'timestamp'

@admin.register(QRCode)
class QRCodeAdmin(admin.ModelAdmin):
    list_display = ('code', 'created_at', 'expires_at', 'is_active')
    list_filter = ('is_active', 'created_at')
    search_fields = ('code',)
    date_hierarchy = 'created_at'