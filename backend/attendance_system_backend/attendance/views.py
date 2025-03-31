from django.utils import timezone
from django.db.models import Q
from user_management.models import CustomUser
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from datetime import datetime, timedelta
import qrcode
import io
import base64
import uuid
from django.core.files.base import ContentFile
import logging

from .models import AttendanceRecord, AttendanceLog, QRCode
from .serializers import (
    AttendanceRecordSerializer, AttendanceLogSerializer, 
    CheckInSerializer, CheckOutSerializer, QRCodeSerializer
)
from user_management.permission import IsAdminUser

class QRCodeViewSet(viewsets.ModelViewSet):
    queryset = QRCode.objects.all()
    serializer_class = QRCodeSerializer
    
    def get_permissions(self):
        """
        Override to set custom permissions per action.
        - generate action: Allow any authenticated user
        - other actions: Only allow admin users
        """
        if self.action == 'generate':
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated, IsAdminUser]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Generate a new QR code that expires in 24 hours"""
        expiration = timezone.now() + timedelta(hours=24)
        code = str(uuid.uuid4())
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(code)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Save QR code to database
        qr_code = QRCode.objects.create(
            code=code,
            expires_at=expiration
        )
        
        # Convert QR code to base64 for sending to frontend
        buffer = io.BytesIO()
        img.save(buffer)
        qr_image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        return Response({
            'id': qr_code.id,
            'code': code,
            'expires_at': expiration,
            'qr_image': f"data:image/png;base64,{qr_image_base64}"
        })

class AttendanceRecordViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceRecordSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'admin':
            queryset = AttendanceRecord.objects.all()
        else:
            queryset = AttendanceRecord.objects.filter(user=user)
        
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        return queryset
    
    def get_permissions(self):
        # Allow authenticated users to access check_in, check_out, list, retrieve, and today_status endpoints.
        if self.action in ['check_in', 'check_out', 'list', 'retrieve', 'today_status']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated, IsAdminUser]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['post'])
    def check_in(self, request):
        serializer = CheckInSerializer(
            data=request.data,
            context={'request': request, 'date': timezone.now().date()}
        )
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        data['check_in_time'] = timezone.now()
        record = serializer.create(data)
        return Response(AttendanceRecordSerializer(record).data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def check_out(self, request):
        user = request.user
        today = timezone.now().date()
        try:
            record = AttendanceRecord.objects.get(user=user, date=today)
        except AttendanceRecord.DoesNotExist:
            return Response({"detail": "No check-in record found for today"}, status=status.HTTP_400_BAD_REQUEST)
        serializer = CheckOutSerializer(data=request.data, context={'request': request, 'date': today})
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        data['check_out_time'] = timezone.now()
        updated_record = serializer.update(record, data)
        return Response(AttendanceRecordSerializer(updated_record).data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def daily_summary(self, request):
        if request.user.user_type != 'admin':
            return Response({"detail": "You do not have permission to perform this action."}, status=status.HTTP_403_FORBIDDEN)
        
        date_str = request.query_params.get('date', None)
        if date_str:
            try:
                date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response({"detail": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            date = timezone.now().date()
        
        records = AttendanceRecord.objects.filter(date=date)
        total_employees = CustomUser.objects.filter(user_type='regular').count()
        present = records.filter(status='present').count()
        absent = total_employees - present
        late = records.filter(status='late').count()
        
        summary = {
            'date': date,
            'total_employees': total_employees,
            'present': present,
            'absent': absent,
            'late': late,
            'present_percentage': (present / total_employees * 100) if total_employees > 0 else 0,
            'records': AttendanceRecordSerializer(records, many=True).data
        }
        
        return Response(summary)
    
    @action(detail=False, methods=['get'])
    def today_status(self, request):
        user = request.user
        today = timezone.now().date()
        try:
            record = AttendanceRecord.objects.get(user=user, date=today)
            serializer = AttendanceRecordSerializer(record)
            return Response(serializer.data)
        except AttendanceRecord.DoesNotExist:
            return Response({
                'status': 'absent',
                'date': today.isoformat(),  # Convert date to string for JSON serialization
                'message': 'You have not checked in today'
        })
        except Exception as e:
            logger = logging.getLogger(__name__)
            logger.error(f"Error in today_status view: {str(e)}")
            
            return Response({
                'status': 'error',
                'message': 'An error occurred while fetching your attendance status',
                'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AttendanceLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AttendanceLogSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'admin':
            queryset = AttendanceLog.objects.all()
        else:
            queryset = AttendanceLog.objects.filter(attendance_record__user=user)
        
        record_id = self.request.query_params.get('record_id')
        if record_id:
            queryset = queryset.filter(attendance_record_id=record_id)
        return queryset
