from django.db import models

class Question(models.Model):
    DIFFICULTY_CHOICES = [
        ("easy", "Easy"),
        ("medium", "Medium"),
        ("hard", "Hard"),
    ]

    question = models.TextField()
    options = models.JSONField()
    correct_answer = models.IntegerField()
    subject = models.CharField(max_length=255)
    topic = models.CharField(max_length=255)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    explanation = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True,null=True)  # Timestamp when the record is created
    updated_at = models.DateTimeField(auto_now=True,null=True)  # Timestamp when the record is last updated
    deleted_at = models.DateTimeField(null=True, blank=True)  # Optional for soft delete

    def __str__(self):
        return self.question
