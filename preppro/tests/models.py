from django.db import models
from django.utils import timezone
from users.models import User
from questions.models import Question

# Test Model
class Test(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard')
    ]
    title = models.CharField(max_length=255)
    description = models.TextField()
    duration = models.PositiveIntegerField()  # Duration in minutes
    total_marks = models.PositiveIntegerField()
    passing_marks = models.PositiveIntegerField()
    subject = models.CharField(max_length=255)
    topic = models.CharField(max_length=255)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    instructions = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    is_published = models.BooleanField(default=False)  # Result published flag
    created_at = models.DateTimeField(auto_now_add=True,null=True)  # Timestamp when the record is created
    updated_at = models.DateTimeField(auto_now=True,null=True)  # Timestamp when the record is last updated
    deleted_at = models.DateTimeField(null=True, blank=True)  # Optional for soft delete

    def __str__(self):
        return self.title

# TestQuestion Model (Mapping Test to Questions)
class TestQuestion(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='test_questions')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True,null=True)  # Timestamp when the record is created
    updated_at = models.DateTimeField(auto_now=True,null=True)  # Timestamp when the record is last updated
    deleted_at = models.DateTimeField(null=True, blank=True)  # Optional for soft delete

    class Meta:
        unique_together = ('test', 'question')

    def __str__(self):
        return f"{self.test.title} - {self.question.question[:50]}"

# TestAssignment Model (Assign Test to Students)
class TestAssignment(models.Model):
    SHOW_RESULTS_CHOICES = [
        ('immediately', 'Immediately'),
        ('after_submission', 'After Submission')
    ]
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name="assignments")
    assigned_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="created_assignments")
    assigned_to = models.JSONField()  # Store student IDs or class info
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    allow_multiple_attempts = models.BooleanField(default=False)
    show_results = models.CharField(max_length=20, choices=SHOW_RESULTS_CHOICES)
    passing_criteria = models.PositiveIntegerField()
    additional_instructions = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True,null=True)  # Timestamp when the record is created
    updated_at = models.DateTimeField(auto_now=True,null=True)  # Timestamp when the record is last updated
    deleted_at = models.DateTimeField(null=True, blank=True)  # Optional for soft delete
    
    def __str__(self):
        return f"{self.test.title} assigned by {self.assigned_by.username}"

# StudentTestAttempt Model (Store Student's Attempt)
class StudentTestAttempt(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='student_tests')
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    answers = models.JSONField()  # { "question_id": selected_option_index }
    score = models.PositiveIntegerField()
    correct_answers = models.PositiveIntegerField(default=0)  # New: Correct answers count
    total_questions = models.PositiveIntegerField(default=0)  # New: Total questions attempted
    response_times = models.JSONField(default=dict)  # { "question_id": time_taken }
    passed = models.BooleanField(default=False)  # New: Pass/Fail status
    attempted_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True,null=True)  # Timestamp when the record is created
    updated_at = models.DateTimeField(auto_now=True,null=True)  # Timestamp when the record is last updated
    deleted_at = models.DateTimeField(null=True, blank=True)  # Optional for soft delete

    def save(self, *args, **kwargs):
        self.passed = self.score >= self.test.passing_marks  # Check if passed
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student.username} - {self.test.title} ({'Passed' if self.passed else 'Failed'})"

class TestFeedback(models.Model):
    attempt = models.ForeignKey('StudentTestAttempt', on_delete=models.CASCADE, related_name='feedbacks')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='requested_feedbacks')
    comments = models.TextField(default="")  # Keep the original field name
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)  # Make it nullable
    is_read = models.BooleanField(default=False)
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('in_progress', 'In Progress'),
            ('completed', 'Completed')
        ],
        default='pending'
    )
    teacher_response = models.TextField(null=True, blank=True)  # Response from teacher
    response_date = models.DateTimeField(null=True, blank=True)  # When teacher responded

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Feedback request from {self.student.username} for {self.attempt.test.title}"

class TestAnalytics(models.Model):
    test = models.OneToOneField(Test, on_delete=models.CASCADE, related_name="analytics")
    average_score = models.FloatField(default=0.0)
    pass_percentage = models.FloatField(default=0.0)  # Percentage of students who passed
    total_attempts = models.PositiveIntegerField(default=0)
    question_difficulty_stats = models.JSONField(default=dict)  # {"question_id": {"correct": 10, "attempted": 50}}
    created_at = models.DateTimeField(auto_now_add=True,null=True)  # Timestamp when the record is created
    updated_at = models.DateTimeField(auto_now=True,null=True)  # Timestamp when the record is last updated
    deleted_at = models.DateTimeField(null=True, blank=True)  # Optional for soft delete

    def update_analytics(self):
        attempts = StudentTestAttempt.objects.filter(test=self.test)
        total_attempts = attempts.count()

        if total_attempts > 0:
            total_score = sum(attempt.score for attempt in attempts)
            passed_count = attempts.filter(passed=True).count()

            self.average_score = total_score / total_attempts
            self.pass_percentage = (passed_count / total_attempts) * 100

            # Question-level analysis
            question_stats = {}
            for attempt in attempts:
                for question_id, selected_option in attempt.answers.items():
                    if question_id not in question_stats:
                        question_stats[question_id] = {"correct": 0, "attempted": 0}
                    question_stats[question_id]["attempted"] += 1
                    try:
                        correct_answer = Question.objects.get(id=question_id).correct_answer
                    except Question.DoesNotExist:
                        continue
                    if selected_option == correct_answer:
                        question_stats[question_id]["correct"] += 1

            self.question_difficulty_stats = question_stats

        self.total_attempts = total_attempts
        self.save()

class PracticeSession(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='practice_sessions')
    input_text = models.TextField()
    summary_points = models.JSONField(null=True, blank=True)  # Store key points
    generated_questions = models.JSONField(null=True, blank=True)  # Store generated MCQs
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('processing', 'Processing'),
            ('completed', 'Completed'),
            ('failed', 'Failed')
        ],
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    error_message = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Practice session for {self.student.username} - {self.created_at}"

