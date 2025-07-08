from django.core.management.base import BaseCommand
from users.models import User
from tests.models import Test, TestAssignment, StudentTestAttempt
from questions.models import Question
from faker import Faker
import random
from django.utils.timezone import now, timedelta

fake = Faker()

class Command(BaseCommand):
    help = "Seed test data for student analytics (user_id=2)"

    def handle(self, *args, **kwargs):
        self.stdout.write("🌱 Seeding test analytics data for user_id=2...")

        #  Get or create teacher
        teacher, _ = User.objects.get_or_create(id=1, defaults={
            "username": "teacher_1",
            "email": fake.unique.email(),
            "role": "teacher"
        })

        #  Get or create student (user_id=2)
        student, _ = User.objects.get_or_create(id=2, defaults={
            "username": "student_1",
            "email": fake.unique.email(),
            "role": "student"
        })

        #  Create Sample Tests
        for _ in range(5):  # Create 5 tests
            test = Test.objects.create(
                title=fake.sentence(nb_words=3),
                description=fake.text(),
                duration=random.randint(10, 60),
                total_marks=10,
                passing_marks=5,
                subject=random.choice(["Math", "Science", "English", "History"]),
                topic=fake.word(),
                difficulty=random.choice(["easy", "medium", "hard"]),
                instructions=fake.sentence(),
                created_by=teacher,
                is_published=True
            )

            #  Assign Test to Student (user_id=2)
            assignment = TestAssignment.objects.create(
                test=test,
                assigned_by=teacher,
                assigned_to=[student.id],
                start_date=now() - timedelta(days=random.randint(5, 15)),
                end_date=now() + timedelta(days=random.randint(1, 10)),
                allow_multiple_attempts=random.choice([True, False]),
                show_results="after_submission",
                passing_criteria=5,
                additional_instructions=fake.sentence()
            )

            #  Create Fake Test Attempts for Student (user_id=2)
            for _ in range(random.randint(1, 3)):  # Student attempts multiple times
                total_questions = random.randint(5, 10)
                correct_answers = random.randint(0, total_questions)  # Random correct answers

                StudentTestAttempt.objects.create(
                    student=student,
                    test=test,
                    answers={str(i): random.randint(1, 4) for i in range(total_questions)},  # Fake answers
                    score=correct_answers,
                    correct_answers=correct_answers,
                    total_questions=total_questions,
                    response_times={str(i): random.randint(5, 30) for i in range(total_questions)},
                    attempted_at=now() - timedelta(days=random.randint(1, 5))
                )

        self.stdout.write(self.style.SUCCESS(" Seeding complete! Test data added for user_id=2."))
