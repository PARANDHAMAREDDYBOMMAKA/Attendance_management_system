from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from user_management.models import CustomUser

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'user_type', 'department', 'employee_id', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('user_type', 'profile_picture', 'department', 'employee_id')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('user_type', 'profile_picture', 'department', 'employee_id')}),
    )

admin.site.register(CustomUser, CustomUserAdmin)