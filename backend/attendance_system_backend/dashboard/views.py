from rest_framework import views, permissions, status
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta

from user_management.models import CustomUser
from attendance.models import AttendanceRecord
from .serializers import UserAttendanceSummarySerializer
from user_management.permission import IsAdminUser

class DashboardStatsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        date_str = request.query_params.get('date', None)
        if date_str:
            try:
                date = timezone.datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response({"detail": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            date = timezone.now().date()
        
        total_employees = CustomUser.objects.filter(user_type='regular').count()
        present_records = AttendanceRecord.objects.filter(date=date, status='present')
        present_count = present_records.count()
        late_count = AttendanceRecord.objects.filter(date=date, status='late').count()
        absent_count = total_employees - present_count - late_count
        
        department_stats = []
        departments = CustomUser.objects.filter(user_type='regular').values_list('department', flat=True).distinct()

        for dept in departments:
            if not dept:
                continue
            dept_employees = CustomUser.objects.filter(user_type='regular', department=dept).count()
            dept_present = present_records.filter(user__department=dept).count()
            dept_absent = dept_employees - dept_present
            
            department_stats.append({
                'department': dept,
                'total_employees': dept_employees,
                'present': dept_present,
                'absent': dept_absent,
                'present_percentage': (dept_present / dept_employees * 100) if dept_employees > 0 else 0
            })
        
        return Response({
            'date': date,
            'total_employees': total_employees,
            'present': present_count,
            'absent': absent_count,
            'late': late_count,
            'present_percentage': (present_count / total_employees * 100) if total_employees > 0 else 0,
            'department_stats': department_stats
        })

class AttendanceTrendsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        days = int(request.query_params.get('days', 30))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days-1)
        
        records = AttendanceRecord.objects.filter(date__gte=start_date, date__lte=end_date)
        
        daily_stats = []
        current_date = start_date
        while current_date <= end_date:
            day_records = records.filter(date=current_date)
            total_employees = CustomUser.objects.filter(user_type='regular').count()
            present_count = day_records.filter(status='present').count()
            late_count = day_records.filter(status='late').count()
            absent_count = total_employees - present_count - late_count
            
            daily_stats.append({
                'date': current_date.isoformat(),
                'present': present_count,
                'absent': absent_count,
                'late': late_count,
                'present_percentage': (present_count / total_employees * 100) if total_employees > 0 else 0
            })
            current_date += timedelta(days=1)
        
        return Response({
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'daily_stats': daily_stats
        })

class UserAttendanceSummaryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        days = int(request.query_params.get('days', 30))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days-1)

        users = CustomUser.objects.filter(user_type='regular')
        user_summaries = []

        for user in users:
            user_records = AttendanceRecord.objects.filter(user=user, date__gte=start_date, date__lte=end_date)
            total_days = (end_date - start_date).days + 1
            present_days = user_records.filter(status='present').count()
            late_days = user_records.filter(status='late').count()
            absent_days = total_days - present_days - late_days

            user_summaries.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'total_days': total_days,
                'present_days': present_days,
                'absent_days': absent_days,
                'late_days': late_days,
                'attendance_percentage': (present_days / total_days * 100) if total_days > 0 else 0
            })

        user_summaries.sort(key=lambda x: x['attendance_percentage'], reverse=True)
        serializer = UserAttendanceSummarySerializer(user_summaries, many=True)
        return Response(serializer.data)
