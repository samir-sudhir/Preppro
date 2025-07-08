from django.contrib.auth.models import AbstractUser, BaseUserManager, Group, Permission
from django.db import models

# Custom User Manager
class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(username, email, password, **extra_fields)

# Custom User Model
class User(AbstractUser):
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=10, 
        choices=[("teacher", "Teacher"), ("student", "Student")]
    )
    created_at = models.DateTimeField(auto_now_add=True,null=True)  # Timestamp when the record is created
    updated_at = models.DateTimeField(auto_now=True,null=True)  # Timestamp when the record is last updated
    deleted_at = models.DateTimeField(null=True, blank=True)  # Optional for soft delete
    groups = models.ManyToManyField(Group, related_name="custom_user_groups", blank=True)
    user_permissions = models.ManyToManyField(Permission, related_name="custom_user_permissions", blank=True)

    objects = CustomUserManager()

    class Meta:
        db_table = "users"

    def __str__(self):
        return self.username

# Profile Model (For Teachers & Students)
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    profile_photo = models.ImageField(upload_to="profile_pics/", null=True, blank=True)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    bio = models.TextField(null=True, blank=True)

    # Fields specific to Teachers
    department = models.CharField(max_length=255, null=True, blank=True)
    subjects = models.JSONField(null=True, blank=True)  # List of subjects they teach

    # Fields specific to Students
    student_class = models.CharField(max_length=50, null=True, blank=True)
    section = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True,null=True)  # Timestamp when the record is created
    updated_at = models.DateTimeField(auto_now=True,null=True)  # Timestamp when the record is last updated
    deleted_at = models.DateTimeField(null=True, blank=True)  # Optional for soft delete

    class Meta:
        db_table = "profiles"

    def __str__(self):
        return f"{self.user.username} - {self.user.role}"
