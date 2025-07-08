from django.urls import path
from .views import (
    QuestionListAPIView,
    QuestionCreateAPIView,
    QuestionRetrieveAPIView,
    QuestionUpdateAPIView,
    QuestionDeleteAPIView,
)

urlpatterns = [
    path("", QuestionListAPIView.as_view(), name="question-list"),
    path("create/", QuestionCreateAPIView.as_view(), name="question-create"),
    path("<int:pk>/", QuestionRetrieveAPIView.as_view(), name="question-detail"),
    path("<int:pk>/update/", QuestionUpdateAPIView.as_view(), name="question-update"),
    path("<int:pk>/delete/", QuestionDeleteAPIView.as_view(), name="question-delete"),
]
