from django.urls import path
from .views import (UserRegistrationView, ProfileSetupView,
    LoginAPIView, LogoutAPIView, ForgotPasswordAPIView, 
    PasswordResetConfirmAPIView, UpdateUserAPIView, 
    UpdateProfileAPIView, DeleteUserAPIView,GetAllUsersAPIView,
    GetUserProfileAPIView,GetAllStudentsAPIView,GlobalFilterOptionsAPIView,
    TeacherCounts,StudentCounts,GetStudentProfileAPIView
)

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('profile-setup/', ProfileSetupView.as_view(), name='profile-setup'),
    path("login/", LoginAPIView.as_view(), name="login"),
    path("logout/", LogoutAPIView.as_view(), name="logout"),
    path("forgot-password/", ForgotPasswordAPIView.as_view(), name="forgot-password"),
    path("reset-password/", PasswordResetConfirmAPIView.as_view(), name="reset-password"),
    path("update-user/", UpdateUserAPIView.as_view(), name="update-user"),
    path("update-profile/", UpdateProfileAPIView.as_view(), name="update-profile"),
    path("delete-user/", DeleteUserAPIView.as_view(), name="delete-user"),
    
    path("fetch/", GetAllUsersAPIView.as_view(), name="get-all-users"),  # Only for Teachers
    path("profile/", GetUserProfileAPIView.as_view(), name="get-user-profile"),  # Fetch user profile
    path("students/", GetAllStudentsAPIView.as_view(), name="get-all-students"),
    path("students/<int:student_id>/profile/", GetStudentProfileAPIView.as_view(), name="get-student-profile"),  # Get specific student profile
    path("students/filter/", GlobalFilterOptionsAPIView.as_view(), name="get-filters-list"),
    path("teacher/counts/", TeacherCounts.as_view(), name="get-teachers-count"),
    path("student/counts/", StudentCounts.as_view(), name="get-students-count"),
]