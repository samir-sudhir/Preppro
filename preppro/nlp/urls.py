from django.urls import path
from . import views

urlpatterns = [
    path('generate-questions/', views.generate_questions, name='generate_questions'),
]