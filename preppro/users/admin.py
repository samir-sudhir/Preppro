from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Profile

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ("id", "username", "email", "role", "is_staff", "is_superuser")
    fieldsets = UserAdmin.fieldsets + (
        (None, {"fields": ("role",)}),
    )

admin.site.register(User, CustomUserAdmin)
admin.site.register(Profile)
