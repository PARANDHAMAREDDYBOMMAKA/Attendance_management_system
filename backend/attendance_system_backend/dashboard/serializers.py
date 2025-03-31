from rest_framework import serializers
from attendance.models import AttendanceRecord, AttendanceLog, QRCode
from user_management.models import CustomUser

class AttendanceLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceLog
        fields = '__all__'

class QRCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = QRCode
        fields = '__all__'

class UserAttendanceSummarySerializer(serializers.ModelSerializer):
    total_days = serializers.IntegerField()
    present_days = serializers.IntegerField()
    absent_days = serializers.IntegerField()
    late_days = serializers.IntegerField()
    attendance_percentage = serializers.FloatField()

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'total_days', 'present_days', 'absent_days', 'late_days', 'attendance_percentage']
