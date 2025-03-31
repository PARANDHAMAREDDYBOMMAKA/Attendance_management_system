from django.test import TestCase
from .models import AttendanceLog

class AttendanceLogTestCase(TestCase):
    def setUp(self):
        AttendanceLog.objects.create(user_id=1, log_time="2023-01-01T08:00:00Z")

    def test_attendance_log_creation(self):
        log = AttendanceLog.objects.get(user_id=1)
        self.assertEqual(log.log_time, "2023-01-01T08:00:00Z")
