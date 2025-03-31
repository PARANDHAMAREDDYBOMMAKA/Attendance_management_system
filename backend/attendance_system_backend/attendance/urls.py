from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AttendanceRecordViewSet, AttendanceLogViewSet, QRCodeViewSet

router = DefaultRouter()
router.register(r'records', AttendanceRecordViewSet, basename='attendance-record')
router.register(r'logs', AttendanceLogViewSet, basename='attendance-log')
router.register(r'qrcodes', QRCodeViewSet, basename='qrcode')

urlpatterns = [
    path('', include(router.urls)),
]
