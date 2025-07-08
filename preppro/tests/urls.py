from django.urls import path
from .views import (
    TestListCreateAPIView, TestRetrieveUpdateDeleteAPIView, 
    TestAssignmentCreateAPIView, StudentTestAttemptAPIView, 
    PublishTestResultAPIView, TestFeedbackAPIView,
    StudentTestAnalyticsAPIView, TeacherTestAnalyticsAPIView,
    TestFeedbackByAttemptAPIView, AllTestFeedbackAPIView,
    TeacherAnalyticsAPIView, StudentAnalyticsAPIView,
    TestCountBySubject, TestCountByMonth, AssignedTestsAPIView,
    TeacherTestStatusAPIView, StudentTestAttemptDetailView,
    StudentSubjectPerformance, StudentMonthlyAnalytics,
    TestFeedbackView, StudentFeedbackListView, MarkFeedbackAsReadView,
    TestAttemptsListView, TestAttemptsByTestView,
    TeacherFeedbackListView, PracticeSessionView, PracticeSessionDetailView
)

urlpatterns = [
    # Base endpoints
    path("tests/", TestListCreateAPIView.as_view(), name="test-list-create"),
    path("tests/<int:pk>/", TestRetrieveUpdateDeleteAPIView.as_view(), name="test-detail"),
    path("tests/assign/", TestAssignmentCreateAPIView.as_view(), name="test-assign"),
    path("tests/status/", TeacherTestStatusAPIView.as_view(), name="test-status"),
    path("tests/assigned/", AssignedTestsAPIView.as_view(), name="test-assigned"),
    
    # Attempts endpoints
    path("tests/attempts/", TestAttemptsListView.as_view(), name="test-attempts-list"),
    path("tests/<int:test_id>/attempts/", TestAttemptsByTestView.as_view(), name="test-attempts-by-test"),
    path("tests/attempt/", StudentTestAttemptAPIView.as_view(), name="test-attempt"),
    
    # Feedback endpoints
    path("tests/feedback/", TestFeedbackView.as_view(), name="test-feedback"),
    path("tests/feedback/list/", StudentFeedbackListView.as_view(), name="feedback-list"),
    path("tests/feedback/<int:feedback_id>/mark-read/", MarkFeedbackAsReadView.as_view(), name="mark-feedback-read"),
    path("tests/attempt/<int:attempt_id>/feedback/", TestFeedbackAPIView.as_view(), name="test-feedback-by-attempt"),
    path("tests/attempt/feedback/", AllTestFeedbackAPIView.as_view(), name="all-feedback"),
    path("tests/attempt/feedback/<int:attempt_id>/", TestFeedbackByAttemptAPIView.as_view(), name="feedback-by-attempt"),
    path("feedback/", TestFeedbackView.as_view(), name="test-feedback"),
    path("feedback/list/", TeacherFeedbackListView.as_view(), name="teacher-feedback-list"),
    
    # Analytics endpoints
    path("tests/analytics/student/", StudentTestAnalyticsAPIView.as_view(), name="student-analytics"),
    path("tests/analytics/teacher/", TeacherTestAnalyticsAPIView.as_view(), name="teacher-analytics"),
    path("tests/analytics/subject-count/", TestCountBySubject.as_view(), name="test-count-by-subject"),
    path("tests/analytics/monthly-count/", TestCountByMonth.as_view(), name="test-count-by-month"),
    path("tests/analytics/student-subject/", StudentSubjectPerformance.as_view(), name="student-subject-performance"),
    path("tests/analytics/student-monthly/", StudentMonthlyAnalytics.as_view(), name="student-monthly-analytics"),
    
    # Other endpoints
    path("tests/<int:test_id>/publish/", PublishTestResultAPIView.as_view(), name="publish-test-result"),
    path("tests/<int:test_id>/attempt-preview/", StudentTestAttemptDetailView.as_view(), name="student-attempt-preview"),
    path('practice/', PracticeSessionView.as_view(), name='practice-session'),
    path('practice/<int:session_id>/', PracticeSessionDetailView.as_view(), name='practice-session-detail'),
]
