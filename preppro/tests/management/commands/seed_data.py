from django.core.management.base import BaseCommand
from faker import Faker
from random import randint, choice
from django.contrib.auth import get_user_model  # Import get_user_model
from tests.models import Test, TestQuestion, StudentTestAttempt, TestFeedback
from django.db.models import F, Avg, Count

class Command(BaseCommand):
    help = 'Seeds test data and analytics for teacher (ID=1)'

    def handle(self, *args, **kwargs):
        fake = Faker()

        # Ensure the teacher exists with ID=1
        User = get_user_model()  # Get the correct user model
        teacher = User.objects.get(id=1)
        self.stdout.write(self.style.SUCCESS(f"Seeding data for teacher {teacher.username}"))

        # Step 1: Seed some tests
        tests = []
        for _ in range(5):  # 5 tests for this teacher
            test = Test.objects.create(
    title="Sample Test",
    description="This is a sample test.",
    duration=60,  # Ensure this value is set
    total_marks=100,
    passing_marks=50,
    subject="Mathematics",
    topic="Algebra",
    difficulty="hard",
    instructions="Please read the instructions carefully.",
    created_by_id=1,
)

            tests.append(test)
            self.stdout.write(self.style.SUCCESS(f"Created test {test.title}"))

        # Step 2: Seed questions for each test
        test_questions = []
        for test in tests:
            for _ in range(10):  # 10 questions per test
                question = TestQuestion.objects.create(
                    test=test,
                    question=fake.sentence(),
                    options={
                        "1": fake.word(),
                        "2": fake.word(),
                        "3": fake.word(),
                        "4": fake.word(),
                    },
                    correct_answer=randint(1, 4),  # Randomly set the correct answer
                )
                test_questions.append(question)
                self.stdout.write(self.style.SUCCESS(f"Created question for test {test.title}"))

        # Step 3: Seed student attempts
        students = User.objects.filter(is_staff=False)  # Only students
        student_attempts = []
        for test in tests:
            for student in students:
                attempt = StudentTestAttempt.objects.create(
                    test=test,
                    student=student,
                    score=randint(0, 100),  # Random score
                )
                student_attempts.append(attempt)
                self.stdout.write(self.style.SUCCESS(f"Created attempt for student {student.username} on test {test.title}"))

        # Step 4: Seed feedback for attempts
        for attempt in student_attempts:
            feedback = TestFeedback.objects.create(
                attempt=attempt,
                given_by=teacher,
                feedback=fake.text(),
                rating=randint(1, 5),  # Random rating for feedback
            )
            self.stdout.write(self.style.SUCCESS(f"Created feedback for attempt {attempt.id}"))

        # Step 5: Run the analytics queries manually to ensure they're correct for this teacher
        # Test performance (average score per test)
        test_performance = (
            StudentTestAttempt.objects
            .filter(test__created_by=teacher)
            .values("test__title")
            .annotate(avg_score=Avg("score"))
        )

        # Top students (top performers based on total score)
        top_students = (
            StudentTestAttempt.objects
            .filter(test__created_by=teacher)
            .values(student_name=F("student__username"))
            .annotate(total_score=Avg("score"))
            .order_by("-total_score")[:5]
        )

        # Hardest questions (lowest number of correct attempts)
        hardest_questions = (
            TestQuestion.objects
            .filter(test__created_by=teacher)
            .values("question__question")
            .annotate(correct_attempts=Count("question__id"))
            .order_by("correct_attempts")[:5]
        )

        # Output analytics data (this is just to verify the seed)
        self.stdout.write(self.style.SUCCESS(f"Test Performance: {list(test_performance)}"))
        self.stdout.write(self.style.SUCCESS(f"Top Students: {list(top_students)}"))
        self.stdout.write(self.style.SUCCESS(f"Hardest Questions: {list(hardest_questions)}"))

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded data for teacher {teacher.username}"))
