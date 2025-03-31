from django.db import models
from django.utils import timezone
from user_management.models import CustomUser

class QRCode(models.Model):
    """
    Model to store QR codes for check-in/check-out with location constraints
    """
    code = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    location_constraint = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Optional location constraint in format 'lat,lng,radius_meters'"
    )

    def __str__(self):
        return f"QR Code {self.code[:10]}... | Expires: {self.expires_at}"
    
    def is_expired(self):
        return timezone.now() > self.expires_at

class AttendanceRecord(models.Model):
    """
    Model to store attendance records
    """
    STATUS_CHOICES = (
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
        ('half_day', 'Half Day'),
    )
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField(default=timezone.now)
    check_in_time = models.DateTimeField(null=True, blank=True)
    check_out_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='absent')
    
    # QR Code verification
    qr_code_data = models.CharField(max_length=255, blank=True, null=True)
    qr_verified = models.BooleanField(default=False)
    
    # Geolocation data
    check_in_location = models.CharField(max_length=255, blank=True, null=True)
    check_out_location = models.CharField(max_length=255, blank=True, null=True)
    geo_verified = models.BooleanField(default=False)
    
    # Face recognition
    face_image_check_in = models.ImageField(upload_to='face_recognition/check_in/', null=True, blank=True)
    face_image_check_out = models.ImageField(upload_to='face_recognition/check_out/', null=True, blank=True)
    face_verified = models.BooleanField(default=False)
    
    notes = models.TextField(blank=True)
    
    class Meta:
        unique_together = ('user', 'date')
        ordering = ['-date', 'user']
    
    def __str__(self):
        return f"{self.user.username} - {self.date} - {self.status}"

class AttendanceLog(models.Model):
    """
    Model to store detailed attendance logs
    """
    LOG_TYPES = (
        ('check_in', 'Check In'),
        ('check_out', 'Check Out'),
        ('manual_entry', 'Manual Entry'),
        ('system', 'System Log'),
    )
    
    attendance_record = models.ForeignKey(
        AttendanceRecord, 
        on_delete=models.CASCADE, 
        related_name='logs'
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    log_type = models.CharField(max_length=20, choices=LOG_TYPES)
    description = models.TextField(blank=True)
    
    # Additional verification data
    location_data = models.CharField(max_length=255, blank=True, null=True)
    qr_data = models.CharField(max_length=255, blank=True, null=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.attendance_record.user.username} - {self.log_type} - {self.timestamp}"
