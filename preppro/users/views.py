from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import login, logout
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from rest_framework import status, generics, views
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Profile, Profile
from tests.models import TestAssignment, StudentTestAttempt
from django.utils import timezone
from django.db.models import Avg


from .serializers import (
    UserSerializer, ProfileSerializer, LoginSerializer, 
    PasswordResetSerializer, PasswordResetConfirmSerializer
    )
from django.db import models
from tests.models import Test, TestAssignment, StudentTestAttempt
from questions.models import Question
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode
from django.urls import reverse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView






class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class ProfileSetupView(generics.CreateAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# Generate JWT Token
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }

# Login API
class LoginAPIView(views.APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        login(request, user)
        return Response({"user": UserSerializer(user).data, "tokens": get_tokens_for_user(user)})

# Logout API
class LogoutAPIView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)

# Forgot Password API


class ForgotPasswordAPIView(views.APIView):
    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        user = get_object_or_404(User, email=email)
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        # Generate correct backend URL for reset-password endpoint
        reset_url = request.build_absolute_uri(
            reverse("reset-password") + f"?uidb64={uid}&token={token}"
        )

        send_mail(
            subject="Password Reset Request",
            message=f"Click the link to reset your password: {reset_url}",
            from_email="noreply@example.com",
            recipient_list=[user.email],
            fail_silently=False,
        )

        return Response({"message": "Password reset email sent."}, status=status.HTTP_200_OK)

# Password Reset Confirm API

class PasswordResetConfirmAPIView(views.APIView):
    def post(self, request):
        uidb64 = request.query_params.get("uidb64")  # Extract uidb64 from URL
        token = request.query_params.get("token")  # Extract token from URL

        if not uidb64 or not token:
            return Response({"error": "Invalid or missing reset link"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)  # Get user using decoded UID

            # Verify the token
            if not default_token_generator.check_token(user, token):
                return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)

            # Validate the new password from request body
            serializer = PasswordResetConfirmSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            # Set and save new password
            user.set_password(serializer.validated_data["new_password"])
            user.save()

            return Response({"message": "Password reset successful"}, status=status.HTTP_200_OK)
        
        except (User.DoesNotExist, ValueError, TypeError):
            return Response({"error": "Invalid user"}, status=status.HTTP_400_BAD_REQUEST)

        except (User.DoesNotExist, ValueError, TypeError):
            return Response({"error": "Invalid user"}, status=status.HTTP_400_BAD_REQUEST)

# Update User API
class UpdateUserAPIView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

# Update Profile API
class UpdateProfileAPIView(generics.UpdateAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return get_object_or_404(Profile, user=self.request.user)

# Delete User & Profile API
class DeleteUserAPIView(views.APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        # Only teachers can delete users
        if request.user.role != "teacher":
            raise PermissionDenied({"message": "Only teachers can delete users."})

        user_id = request.data.get('user_id')
        if not user_id:
            return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_to_delete = User.objects.get(id=user_id)
            # Prevent deleting teachers
            if user_to_delete.role == "teacher":
                return Response({"error": "Cannot delete teacher accounts"}, status=status.HTTP_403_FORBIDDEN)
            user_to_delete.delete()
            return Response({"message": "User deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

# Get All Users (Only for Teachers)
class GetAllUsersAPIView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != "teacher":  # Ensure only teachers can access
            if not self.request.user.role or self.request.user.role.lower() != "teacher":
                raise PermissionDenied({"message": "Not authenticated user."}) 
        
        return User.objects.all()

    def list(self, request, *args, **kwargs):
        users = self.get_queryset()
        data = []

        for user in users:
            try:
                profile = Profile.objects.get(user=user)
                user_data = {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role,
                    "profile": {
                        "first_name": profile.first_name,
                        "last_name": profile.last_name,
                        "phone_number": profile.phone_number,
                        "address": profile.address,
                    },
                }
            except Profile.DoesNotExist:
                user_data = {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role,
                    "profile": None,  # No profile found
                }
            data.append(user_data)

        return Response(data, status=status.HTTP_200_OK)

class GetUserProfileAPIView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        try:
            profile = Profile.objects.get(user=user)
            data = {
                "id": user.id,
                "username": user.username,
                "email": user.email,  # Include email
                "role": user.role,
                "profile": {
                    "first_name": profile.first_name,
                    "last_name": profile.last_name,
                    "phone_number": profile.phone_number,
                    "address": profile.address,
                    "department": getattr(profile, "department", None),
                    "class": getattr(profile, "student_class", None),
                    "subjects": getattr(profile, "subjects", None),
                    "date_of_birth": getattr(profile, "date_of_birth", None),
                    "section": getattr(profile, "section", None),
                    "bio": getattr(profile, "bio", None),
                    "profile_photo": request.build_absolute_uri(profile.profile_photo.url) if profile.profile_photo else None,
                    
                },
            }
            return Response(data, status=status.HTTP_200_OK)
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
        
# API to Get All Students
# API to Get All Students with Class & Section
class GetAllStudentsAPIView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only teachers can fetch student details
        if self.request.user.role != "teacher":
            raise PermissionDenied({"message": "Only teachers can view students."})
        
        return User.objects.filter(role="student")

    def list(self, request, *args, **kwargs):
        students = self.get_queryset()
        data = []

        for student in students:
            try:
                profile = Profile.objects.get(user=student)
                student_data = {
                    "id": student.id,
                    "username": student.username,
                    "email": student.email,
                    "role": student.role,
                    "profile": {
                        "first_name": profile.first_name,
                        "last_name": profile.last_name,
                        "phone_number": profile.phone_number,
                        "address": profile.address,
                        "date_of_birth": profile.date_of_birth,
                        "bio": profile.bio,
                        "class": profile.student_class,  # student_class field
                        "section": profile.section,      # section field
                        # Subjects if needed (only if you later add subjects for students)
                        # "subjects": profile.subjects,  # (optional, currently only teachers have subjects)
                    },
                }
            except Profile.DoesNotExist:
                student_data = {
                    "id": student.id,
                    "username": student.username,
                    "email": student.email,
                    "role": student.role,
                    "profile": None,
                }
            data.append(student_data)

        return Response(data, status=status.HTTP_200_OK)
    
class GlobalFilterOptionsAPIView(APIView):
    permission_classes = [IsAuthenticated]  # Or AllowAny if you want public access

    def get(self, request):
        # Get ALL unique student classes and sections
        classes = Profile.objects.exclude(student_class__isnull=True).exclude(student_class__exact='').values_list('student_class', flat=True).distinct()
        sections = Profile.objects.exclude(section__isnull=True).exclude(section__exact='').values_list('section', flat=True).distinct()

        # Get ALL subjects from teachers' profiles
        teacher_profiles = Profile.objects.exclude(subjects__isnull=True)
        subjects_set = set()
        for profile in teacher_profiles:
            if isinstance(profile.subjects, list):
                subjects_set.update(profile.subjects)

        data = {
            "classes": sorted(list(classes)),
            "sections": sorted(list(sections)),
            "subjects": sorted(list(subjects_set)),
        }

        return Response(data)
    
class TeacherCounts(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != "teacher":
            return Response({"detail": "Not authorized"}, status=403)

        # Total Questions
        total_questions = Question.objects.filter(deleted_at__isnull=True).count()

        # Active Tests created by this teacher
        active_tests = Test.objects.filter(created_by=user, deleted_at__isnull=True).count()

        # Assigned Classes by this teacher
        assignments = TestAssignment.objects.filter(assigned_by=user, deleted_at__isnull=True)
        assigned_classes = set()

        for assignment in assignments:
            assigned_to = assignment.assigned_to or []
            if isinstance(assigned_to, list):
                for item in assigned_to:
                    if isinstance(item, str):
                        # Normalize strings, remove "class", and lowercase
                        assigned_classes.add(item.strip().lower().replace("class", "").strip())

        # Debug print: show assigned classes
        print("Assigned classes:", assigned_classes)

        # Get student user_ids where the role is 'student'
        student_users = User.objects.filter(role="student").values_list('id', flat=True)

        # Total number of students (no class filtering)
        student_count = Profile.objects.filter(
            user_id__in=student_users,  # Filter students with role 'student'
            deleted_at__isnull=True
        ).count()

        # Count the number of teachers
        teacher_count = User.objects.filter(role="teacher", deleted_at__isnull=True).count()

        return Response({
            "total_questions": total_questions,
            "active_tests": active_tests,
            "student_count": student_count,
            "teacher_count": teacher_count
        })


class StudentCounts(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = user.profile
        student_class = profile.student_class  # Assuming a field for class

        # Get all assigned tests
        assigned_tests = TestAssignment.objects.filter(assigned_to__contains=[user.id])
        attempted_test_ids = StudentTestAttempt.objects.filter(student=user).values_list('test_id', flat=True)

        # Active tests: assigned and not yet attempted
        active_tests = assigned_tests.exclude(test_id__in=attempted_test_ids).count()

        # Pending tests: not attempted and past end_date
        pending_tests = assigned_tests.exclude(test_id__in=attempted_test_ids).filter(end_date__lt=timezone.now()).count()

        # Total students in the same class
        class_total_students = User.objects.filter(profile__student_class=student_class, role='student').count()

        # Calculate student rank based on average score
        classmates = User.objects.filter(profile__student_class=student_class, role='student')
        scores = []

        for student in classmates:
            avg_score = StudentTestAttempt.objects.filter(student=student).aggregate(avg=Avg('score'))['avg'] or 0
            scores.append((student.id, avg_score))

        scores.sort(key=lambda x: x[1], reverse=True)
        student_rank = next((i + 1 for i, s in enumerate(scores) if s[0] == user.id), None)

        return Response({
            "active_tests": active_tests,
            "pending_tests": pending_tests,
            "class_total_students": class_total_students,
            "student_rank": student_rank
        })

class GetStudentProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):
        # Only teachers can fetch student details
        if request.user.role != "teacher":
            raise PermissionDenied({"message": "Only teachers can view students."})
        
        try:
            student = User.objects.get(id=student_id, role="student")
            profile = Profile.objects.get(user=student)
            data = {
                "id": student.id,
                "username": student.username,
                "email": student.email,
                "role": student.role,
                "profile": {
                    "first_name": profile.first_name,
                    "last_name": profile.last_name,
                    "phone_number": profile.phone_number,
                    "address": profile.address,
                    "date_of_birth": profile.date_of_birth,
                    "bio": profile.bio,
                    "student_class": profile.student_class,  # Make sure this field is included
                    "section": profile.section,
                    "profile_photo": request.build_absolute_uri(profile.profile_photo.url) if profile.profile_photo else None,
                },
            }
            return Response(data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
        except Profile.DoesNotExist:
            return Response({"error": "Student profile not found"}, status=status.HTTP_404_NOT_FOUND)