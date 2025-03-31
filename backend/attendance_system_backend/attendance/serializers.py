from rest_framework import serializers
from .models import AttendanceRecord, AttendanceLog, QRCode
from user_management.serializers import UserSerializer
import base64
from django.core.files.base import ContentFile
import uuid

class QRCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = QRCode
        fields = ['id', 'code', 'created_at', 'expires_at', 'is_active']
        read_only_fields = ['id', 'created_at']

class AttendanceLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceLog
        fields = ['id', 'log_type', 'timestamp', 'description', 'location_data', 'qr_data']
        read_only_fields = ['id', 'timestamp']

class AttendanceRecordSerializer(serializers.ModelSerializer):
    logs = AttendanceLogSerializer(many=True, read_only=True)
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = AttendanceRecord
        fields = [
            'id', 'user', 'user_details', 'date', 'check_in_time', 'check_out_time', 
            'status', 'qr_code_data', 'qr_verified', 'check_in_location', 
            'check_out_location', 'geo_verified', 'face_image_check_in', 
            'face_image_check_out', 'face_verified', 'notes', 'logs'
        ]
        read_only_fields = ['id', 'user_details', 'qr_verified', 'geo_verified', 'face_verified']

class CheckInSerializer(serializers.Serializer):
    qr_code_data = serializers.CharField(required=True)
    geolocation = serializers.CharField(required=True)
    face_image = serializers.CharField(required=False)  # Base64 encoded image
    
    def validate_qr_code_data(self, value):
        try:
            qr_code = QRCode.objects.get(code=value, is_active=True)
            if qr_code.is_expired():
                raise serializers.ValidationError("QR code has expired")
            return value
        except QRCode.DoesNotExist:
            raise serializers.ValidationError("Invalid QR code")

    def create(self, validated_data):
        user = self.context['request'].user
        
        # Process face image if provided
        face_image = None
        if 'face_image' in validated_data and validated_data['face_image']:
            image_data = validated_data['face_image']
            if ';base64,' in image_data:
                format, imgstr = image_data.split(';base64,')
                ext = format.split('/')[-1]
                face_image = ContentFile(
                    base64.b64decode(imgstr), 
                    name=f"{uuid.uuid4()}.{ext}"
                )
        
        # Check if a record for today already exists
        today = validated_data.get('date', None)
        try:
            record = AttendanceRecord.objects.get(user=user, date=today)
            # Update existing record for check-in
            record.check_in_time = validated_data.get('check_in_time')
            record.qr_code_data = validated_data.get('qr_code_data')
            record.check_in_location = validated_data.get('geolocation')
            if face_image:
                record.face_image_check_in = face_image
            record.status = 'present'
            record.qr_verified = True
            record.geo_verified = True
            record.face_verified = bool(face_image)
            record.save()
        except AttendanceRecord.DoesNotExist:
            # Create new record
            record_data = {
                'user': user,
                'date': today,
                'check_in_time': validated_data.get('check_in_time'),
                'qr_code_data': validated_data.get('qr_code_data'),
                'check_in_location': validated_data.get('geolocation'),
                'status': 'present',
                'qr_verified': True,
                'geo_verified': True,
                'face_verified': bool(face_image)
            }
            if face_image:
                record_data['face_image_check_in'] = face_image
            
            record = AttendanceRecord.objects.create(**record_data)
        
        # Create log entry
        AttendanceLog.objects.create(
            attendance_record=record,
            log_type='check_in',
            description='User checked in',
            location_data=validated_data.get('geolocation'),
            qr_data=validated_data.get('qr_code_data')
        )
        
        return record

class CheckOutSerializer(serializers.Serializer):
    qr_code_data = serializers.CharField(required=True)
    geolocation = serializers.CharField(required=True)
    face_image = serializers.CharField(required=False)  # Base64 encoded image
    
    def validate_qr_code_data(self, value):
        try:
            qr_code = QRCode.objects.get(code=value, is_active=True)
            if qr_code.is_expired():
                raise serializers.ValidationError("QR code has expired")
            return value
        except QRCode.DoesNotExist:
            raise serializers.ValidationError("Invalid QR code")
    
    def validate(self, data):
        user = self.context['request'].user
        today = self.context.get('date', None)
        
        try:
            record = AttendanceRecord.objects.get(user=user, date=today)
            if not record.check_in_time:
                raise serializers.ValidationError("Cannot check out before checking in")
            return data
        except AttendanceRecord.DoesNotExist:
            raise serializers.ValidationError("No check-in record found for today")
    
    def update(self, instance, validated_data):
        # Process face image if provided
        face_image = None
        if 'face_image' in validated_data and validated_data['face_image']:
            image_data = validated_data['face_image']
            if ';base64,' in image_data:
                format, imgstr = image_data.split(';base64,')
                ext = format.split('/')[-1]
                face_image = ContentFile(
                    base64.b64decode(imgstr), 
                    name=f"{uuid.uuid4()}.{ext}"
                )
        
        # Update record for check-out
        instance.check_out_time = validated_data.get('check_out_time')
        instance.check_out_location = validated_data.get('geolocation')
        if face_image:
            instance.face_image_check_out = face_image
        instance.save()
        
        # Create log entry
        AttendanceLog.objects.create(
            attendance_record=instance,
            log_type='check_out',
            description='User checked out',
            location_data=validated_data.get('geolocation'),
            qr_data=validated_data.get('qr_code_data')
        )
        
        return instance