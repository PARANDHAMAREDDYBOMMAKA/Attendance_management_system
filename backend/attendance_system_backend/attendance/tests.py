from django.test import TestCase
from .models import AttendanceRecord

class AttendanceRecordTestCase(TestCase):
    def setUp(self):
        AttendanceRecord.objects.create(user_id=1, check_in_time="2023-01-01T08:00:00Z")

    def test_attendance_record_creation(self):
        record = AttendanceRecord.objects.get(user_id=1)
        self.assertEqual(record.check_in_time, "2023-01-01T08:00:00Z")
