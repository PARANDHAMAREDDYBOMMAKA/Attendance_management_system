from django.urls import path
from .views import DashboardStatsView, AttendanceTrendsView, UserAttendanceSummaryView

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('trends/', AttendanceTrendsView.as_view(), name='attendance-trends'),
    path('user-summary/', UserAttendanceSummaryView.as_view(), name='user-attendance-summary'),
]