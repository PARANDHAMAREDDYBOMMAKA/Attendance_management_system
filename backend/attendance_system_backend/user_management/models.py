from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class CustomUser(AbstractUser):
    USER_TYPES = (
        ('admin', 'Admin'),
        ('regular', 'Regular User'),
    )
    
    user_type = models.CharField(
        max_length=10, 
        choices=USER_TYPES, 
        default='regular',
        verbose_name=_('User Type')
    )
    profile_picture = models.ImageField(
        upload_to='profile_pictures/',
        null=True,
        blank=True,
        verbose_name=_('Profile Picture')
    )
    department = models.CharField(
        max_length=100, 
        blank=True, 
        verbose_name=_('Department')
    )
    employee_id = models.CharField(
        max_length=50, 
        unique=True, 
        blank=True, 
        null=True, 
        verbose_name=_('Employee ID')
    )
    
    def __str__(self):
        return self.username
    
    class Meta:
        verbose_name = _('User')
        verbose_name_plural = _('Users')