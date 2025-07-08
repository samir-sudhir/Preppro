from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db import transaction
from rest_framework.exceptions import PermissionDenied
from django.http import HttpResponse, JsonResponse
from django.db.models.functions import TruncMonth
from django.conf import settings
from .serializers import TestQuestionSerializer, QuestionSerializer, AttemptedTestWithStudentSerializer, TestSerializer, StudentAttemptQuestionDetailSerializer, TestFeedbackSerializer, PracticeSessionSerializer


from django.db.models import Avg, Count, F, Q
import plotly.express as px
import plotly.io as pio

import pandas as pd
from django.db import connection


import io
import base64
import requests
import threading


from users.serializers import UserSerializer

from .models import (
    Test, TestQuestion, Question, TestAssignment, StudentTestAttempt, 
    TestFeedback, TestAnalytics, PracticeSession
)
from .serializers import (
    TestSerializer, TestAssignmentSerializer, StudentTestAttemptSerializer, AttemptedTestWithStudentSerializer,
    TestFeedbackSerializer
)
from rest_framework.permissions import IsAuthenticated



#  List & Create Tests
class TestListCreateAPIView(generics.ListCreateAPIView):
    queryset = Test.objects.all()
    serializer_class = TestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "teacher":
            return Test.objects.filter(created_by=user)
        elif user.role == "student":
            assigned_tests = TestAssignment.objects.filter(assigned_to=user).values_list("test", flat=True)
            return Test.objects.filter(id__in=assigned_tests)
        return Test.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != "teacher":
            raise PermissionDenied("Only teachers can create tests.")

        with transaction.atomic():
            test = serializer.save(created_by=user)

            # Save test questions
            test_questions_data = self.request.data.get("test_questions", [])
            test_questions = [
                TestQuestion(test=test, question=Question.objects.get(id=item["question"]))
                for item in test_questions_data
                if Question.objects.filter(id=item["question"]).exists()
            ]
            TestQuestion.objects.bulk_create(test_questions)


#  Retrieve, Update, Delete Test
class TestRetrieveUpdateDeleteAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Test.objects.all()
    serializer_class = TestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        test = get_object_or_404(Test, id=self.kwargs["pk"])
        if test.created_by != self.request.user:
            raise PermissionDenied("You can only manage tests that you created.")
        return test

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        return Response({"message": "Test updated successfully!", "data": response.data}, status=status.HTTP_200_OK)

    def perform_update(self, serializer):
        test = self.get_object()

        with transaction.atomic():
            updated_test = serializer.save()

            # Update test questions
            new_questions_data = self.request.data.get("test_questions", [])
            new_question_ids = [item.get("question") for item in new_questions_data]

            # Remove old questions not in the new list
            TestQuestion.objects.filter(test=test).exclude(question_id__in=new_question_ids).delete()

            # Add new questions that are not already linked
            existing_question_ids = set(TestQuestion.objects.filter(test=test).values_list("question_id", flat=True))

            new_test_questions = [
                TestQuestion(test=test, question_id=q_id)
                for q_id in new_question_ids if q_id not in existing_question_ids
            ]
            TestQuestion.objects.bulk_create(new_test_questions)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({"message": "Test deleted successfully!"}, status=status.HTTP_200_OK)

    def perform_destroy(self, instance):
        with transaction.atomic():
            TestQuestion.objects.filter(test=instance).delete()
            instance.delete()


#  Assign Test to Students
class TestAssignmentCreateAPIView(generics.CreateAPIView):
    queryset = TestAssignment.objects.all()
    serializer_class = TestAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != "teacher":
            raise PermissionDenied("Only teachers can assign tests.")

        serializer.save(assigned_by_id=user.id)


#  Student Attempts Test
class StudentTestAttemptAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        student = request.user
        test_id = request.data.get("test_id")
        answers = request.data.get("answers", {})
        response_times = request.data.get("response_times", {})

        # Validate test existence
        test = get_object_or_404(Test, id=test_id)

        # Find assignments for the test
        assignments = TestAssignment.objects.filter(test=test)
        if not assignments.exists():
            return Response({"error": "No assignments found for this test."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the student is assigned to the test in any assignment
        assigned = False
        for assignment in assignments:
            if student.id in assignment.assigned_to:
                assigned = True
                break
        if not assigned:
            return Response({"error": "You are not assigned to this test."}, status=status.HTTP_403_FORBIDDEN)

        # Fetch all questions for the test
        test_questions = TestQuestion.objects.filter(test=test).select_related("question")
        if not test_questions.exists():
            return Response({"error": "No questions found for this test."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate and process answers
        correct_answers = {}
        valid_question_ids = set()
        for tq in test_questions:
            try:
                if tq.question:  # Ensure the question exists
                    correct_answers[tq.question.id] = tq.question.correct_answer
                    valid_question_ids.add(tq.question.id)
            except Exception:
                # Skip if question does not exist
                continue

        # Validate that answers only contain valid question IDs
        for q_id in answers.keys():
            try:
                q_id_int = int(q_id)
                if q_id_int not in valid_question_ids:
                    return Response({"error": f"Invalid question ID in answers: {q_id}"}, status=status.HTTP_400_BAD_REQUEST)
            except ValueError:
                return Response({"error": f"Invalid question ID format: {q_id}"}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate the score
        correct_count = 0
        for q_id, ans in answers.items():
            try:
                q_id_int = int(q_id)
                if correct_answers.get(q_id_int) == int(ans):
                    correct_count += 1
            except (ValueError, TypeError):
                return Response({"error": f"Invalid answer format for question ID {q_id}."}, status=status.HTTP_400_BAD_REQUEST)

        total_questions = len(test_questions)

        # Save the test attempt
        attempt = StudentTestAttempt.objects.create(
            student=student,
            test=test,
            answers=answers,
            score=correct_count,
            correct_answers=correct_count,
            total_questions=total_questions,
            response_times=response_times
        )

        # Update test analytics
        analytics, _ = TestAnalytics.objects.get_or_create(test=test)
        analytics.update_analytics()

        # Serialize and return the response
        serializer = StudentTestAttemptSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class AssignedTestsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # Get tests assigned to the logged-in user
        assigned_tests = TestAssignment.objects.filter(
            assigned_to__contains=[user.id]
        ).select_related('test')

        if not assigned_tests.exists():
            return Response({"message": "No tests assigned."}, status=status.HTTP_404_NOT_FOUND)

        data = []
        for assignment in assigned_tests:
            test = assignment.test
            questions = TestQuestion.objects.filter(test=test).select_related('question')
            student_attempts = StudentTestAttempt.objects.filter(test=test, student=user).order_by('-attempted_at')

            is_attempted = student_attempts.exists()
            latest_attempt = student_attempts.first() if is_attempted else None
            next_attempt = student_attempts[1] if len(student_attempts) > 1 else None

            is_submitted = latest_attempt and latest_attempt.score is not None
            has_multiple_attempts = assignment.allow_multiple_attempts

            test_data = {
                "test": TestSerializer(test).data,
                "questions": TestQuestionSerializer(questions, many=True).data,
                "attempted": is_attempted,
                "is_submitted": is_submitted,
                "latest_attempt": StudentTestAttemptSerializer(latest_attempt).data if latest_attempt else None,
                "next_attempt": StudentTestAttemptSerializer(next_attempt).data if next_attempt else None,
                "allow_multiple_attempts": has_multiple_attempts,
                "show_results": assignment.show_results,
                "start_date": assignment.start_date,
                "end_date": assignment.end_date
            }
            data.append(test_data)

        return Response(data, status=status.HTTP_200_OK)


#  Publish Test Results
class PublishTestResultAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, test_id):
        test = get_object_or_404(Test, id=test_id)

        if test.created_by != request.user:
            return Response({"error": "You are not authorized to publish this test."}, status=status.HTTP_403_FORBIDDEN)

        if test.is_published:
            return Response({"message": "Test result is already published."}, status=status.HTTP_400_BAD_REQUEST)

        test.is_published = True
        test.save()

        return Response({"message": "Test results published successfully!"}, status=status.HTTP_200_OK)


#  Test Feedback (Create & Retrieve)
class TestFeedbackAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, attempt_id):
        teacher = request.user
        attempt = get_object_or_404(StudentTestAttempt, id=attempt_id, test__created_by=teacher)
        
        print("Attempt: ",attempt)

        feedback_text = request.data.get("feedback_text")
        rating = request.data.get("rating", 5)  # Default rating is 5

        if not feedback_text:
            return Response({"error": "Feedback text is required."}, status=status.HTTP_400_BAD_REQUEST)

        #  Calculate percentage
        percentage = (attempt.score / attempt.total_questions) * 100
        percentage=round(percentage,2)

        #  Store feedback with percentage
        feedback = TestFeedback.objects.create(
            test=attempt.test,
            student=attempt.student,
            attempt=attempt,
            comments=feedback_text,
            rating=rating,
            given_by=teacher,
            percentage=percentage
        )

        return Response({"message": "Feedback submitted successfully!", "percentage": percentage}, status=status.HTTP_201_CREATED)
    




#  Student Test Analytics
class StudentTestAnalyticsAPIView(APIView):
    """Analytics API for students to track their performance."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        student = request.user
        
        #  Get all attempted tests
        attempted_tests = StudentTestAttempt.objects.filter(student=student)

        #  Calculate average score
        avg_score = attempted_tests.aggregate(Avg("score"))["score__avg"] or 0

        #  Get subject-wise performance
        subject_performance = attempted_tests.values("test__subject").annotate(avg_score=Avg("score"))

        #  Get performance over time (progress graph)
        performance_over_time = attempted_tests.order_by("attempted_at").values("attempted_at", "score")

        #  Identify most challenging questions (lowest correct attempts)
        challenging_questions = (
            TestQuestion.objects
            .filter(test__studenttestattempt__student=student)
            .values("question__question")
            .annotate(correct_attempts=Count("question__id"))
            .order_by("correct_attempts")[:5]
        )

        data = {
            "average_score": round(avg_score, 2),
            "subject_performance": list(subject_performance),
            "performance_over_time": list(performance_over_time),
            "challenging_questions": list(challenging_questions),
        }
        return Response(data)


#  Teacher Test Analytics
class TeacherTestAnalyticsAPIView(APIView):
    """Analytics API for teachers to track student performance."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        teacher = request.user

        #  Get all tests created by teacher
        tests = Test.objects.filter(created_by=teacher)
        test_data = TestSerializer(tests, many=True).data

        #  Calculate average student score per test
        test_performance = (
            StudentTestAttempt.objects
            .filter(test__created_by=teacher)
            .values("test__title")
            .annotate(avg_score=Avg("score"))
        )

        #  Get student rankings (top performers)
        top_students = (
            StudentTestAttempt.objects
            .filter(test__created_by=teacher)
            .values(student_name=F("student__username"))
            .annotate(total_score=Avg("score"))
            .order_by("-total_score")[:5]
        )

        #  Identify hardest questions (lowest correct answers)
        hardest_questions = (
            TestQuestion.objects
            .filter(test__created_by=teacher)
            .values("question__question")
            .annotate(correct_attempts=Count("question__id"))
            .order_by("correct_attempts")[:5]
        )

        data = {
            "tests_created": test_data,
            "test_performance": list(test_performance),
            "top_students": list(top_students),
            "hardest_questions": list(hardest_questions),
        }
        return Response(data)

class AllTestFeedbackAPIView(APIView):
    """API to fetch all feedback given by a teacher."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        teacher = request.user

        # Get all feedback given by this teacher with related data
        feedbacks = TestFeedback.objects.filter(given_by=teacher).select_related('test', 'student', 'given_by')
        
        # Serialize the feedbacks with additional fields
        feedback_data = [
            {
                "id": feedback.id,
                "test_title": feedback.test.title,
                "student_name": feedback.student.username,
                "given_by_name": feedback.given_by.username,
                "comments": feedback.comments,
                "rating": feedback.rating,
                "percentage": feedback.percentage,
                "created_at": feedback.created_at,
            }
            for feedback in feedbacks
        ]

        return Response(feedback_data, status=200)

#  Get feedback by `attempt_id`
class TestFeedbackByAttemptAPIView(APIView):
    """API to fetch feedback for a specific test attempt."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, attempt_id):
        #  Ensure the attempt exists
        attempt = get_object_or_404(StudentTestAttempt, id=attempt_id)

        #  Get feedback for this test attempt
        feedback = TestFeedback.objects.filter(attempt=attempt)
        serializer = TestFeedbackSerializer(feedback, many=True)

        return Response(serializer.data, status=200)
    


class StudentAnalyticsAPIView(APIView):
    """API for student performance analytics (Interactive Graphs using Raw SQL)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        student = request.user  # Get logged-in student
        student_id = student.id

        student_data = {
            "id": student_id,
            "username": student.username,
            "email": student.email
        }

        with connection.cursor() as cursor:
            #  Fetch Performance Over Time Data (Raw Query)
            cursor.execute("""
                SELECT attempted_at::DATE as date, score 
                FROM tests_studenttestattempt 
                WHERE student_id = %s 
                ORDER BY attempted_at;
            """, [student_id])
            performance_data = cursor.fetchall()

            #  Fetch Subject-Wise Performance Data (Raw Query)
            cursor.execute("""
                SELECT t.subject, AVG(sta.score) as avg_score
                FROM tests_studenttestattempt sta
                JOIN tests_test t ON sta.test_id = t.id
                WHERE sta.student_id = %s
                GROUP BY t.subject;
            """, [student_id])
            subject_performance_data = cursor.fetchall()

            #  Fetch Test Participation Data (Raw Query)
            cursor.execute("""
                SELECT COUNT(*) FROM tests_testassignment WHERE assigned_to @> %s;
            """, [f'[{student_id}]'])
            total_tests = cursor.fetchone()[0] or 0

            cursor.execute("""
                SELECT COUNT(*) FROM tests_studenttestattempt WHERE student_id = %s;
            """, [student_id])
            attempted_tests = cursor.fetchone()[0] or 0

        not_attempted = max(total_tests - attempted_tests, 0)

        #  Generate Performance Graph (Line Chart)
        if performance_data:
            df_performance = pd.DataFrame(performance_data, columns=["Date", "Score"])
            fig = px.line(df_performance, x="Date", y="Score", title="Performance Over Time", markers=True)
            performance_graph = self.get_image_base64(fig)
        else:
            performance_graph = None

        #  Generate Subject-Wise Performance Graph (Bar Chart)
        if subject_performance_data:
            df_subjects = pd.DataFrame(subject_performance_data, columns=["Subject", "Avg_Score"])
            fig = px.bar(df_subjects, x="Subject", y="Avg_Score", text="Avg_Score",
                         title="Subject-Wise Performance", color="Avg_Score")
            subject_graph = self.get_image_base64(fig)
        else:
            subject_graph = None

        #  Generate Test Participation Graph (Pie Chart)
        if total_tests > 0:
            df_participation = pd.DataFrame({
                "Category": ["Attempted", "Not Attempted"],
                "Count": [attempted_tests, not_attempted]
            })
            fig = px.pie(df_participation, names="Category", values="Count", title="Test Participation")
            participation_graph = self.get_image_base64(fig)
        else:
            participation_graph = None

        #  Return Analytics as JSON Response with Base64 Images
        data = {
            "student": student_data,
            "performance_graph": performance_graph,
            "subject_graph": subject_graph,
            "participation_graph": participation_graph,
        }
        return JsonResponse(data)

    def get_image_base64(self, fig):
        """Convert Plotly figure to Base64 image."""
        img_bytes = fig.to_image(format="png")
        return f"data:image/png;base64,{base64.b64encode(img_bytes).decode()}"

class TeacherAnalyticsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        teacher = request.user
        teacher_id = teacher.id

        with connection.cursor() as cursor:
            #  Fetch test participation data
            cursor.execute("""
                SELECT COUNT(DISTINCT tests_studenttestattempt.test_id) as attempted_tests
                FROM tests_studenttestattempt
                WHERE test_id IN (SELECT id FROM tests_test WHERE created_by_id = %s);
            """, [teacher_id])
            attempted_tests = cursor.fetchone()[0] or 0

            cursor.execute("""
                SELECT COUNT(*) as total_tests FROM tests_test WHERE created_by_id = %s;
            """, [teacher_id])
            total_tests = cursor.fetchone()[0] or 0

        not_attempted = max(total_tests - attempted_tests, 0)

        #  Create Plotly Pie Chart
        df_participation = pd.DataFrame({
            "Category": ["Attempted", "Not Attempted"],
            "Count": [attempted_tests, not_attempted]
        })

        fig = px.pie(df_participation, values="Count", names="Category", title="Student Test Participation")
        html_content = pio.to_html(fig, full_html=True)

        return HttpResponse(html_content)

class TestCountBySubject(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        tests = Test.objects.filter(created_by=user, deleted_at__isnull=True)
        data = tests.values('subject').annotate(count=Count('id')).order_by('-count')
        
        return Response(data)
    

class TestCountByMonth(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        tests = Test.objects.filter(created_by=user, deleted_at__isnull=True)

        # Group by month
        data = tests.annotate(month=TruncMonth('created_at')) \
                    .values('month') \
                    .annotate(count=Count('id')) \
                    .order_by('month')

        # Format month to readable format
        formatted_data = [
            {
                "month": item["month"].strftime("%B %Y") if item["month"] else "Unknown",
                "count": item["count"]
            }
            for item in data
        ]

        return Response(formatted_data)


class TeacherTestStatusAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        teacher = request.user

        # Only get tests created by the teacher
        tests = Test.objects.filter(created_by=teacher)

        # Get query param: status = "attempted", "unattempted", or "all"
        status_filter = request.query_params.get("status", "all")

        # Get all test IDs
        test_ids = tests.values_list('id', flat=True)

        # Get all attempts for these tests
        attempts = StudentTestAttempt.objects.filter(test_id__in=test_ids)

        # Build response data based on status
        if status_filter == "attempted":
            serializer = AttemptedTestWithStudentSerializer(attempts, many=True)
            return Response({"status": "attempted", "data": serializer.data}, status=status.HTTP_200_OK)

        elif status_filter == "unattempted":
            # Step 1: Get all assignments for teacher's tests
            assignments = TestAssignment.objects.filter(test_id__in=test_ids)

            unattempted_data = []

            for assignment in assignments:
                for student_id in assignment.assigned_to:
                    has_attempted = attempts.filter(test=assignment.test, student_id=student_id).exists()
                    if not has_attempted:
                        unattempted_data.append({
                            "test_id": assignment.test.id,
                            "test_title": assignment.test.title,
                            "student_id": student_id
                        })

            return Response({"status": "unattempted", "data": unattempted_data}, status=status.HTTP_200_OK)

        else:  # "all" — show both attempted and unattempted
            attempted_serializer = AttemptedTestWithStudentSerializer(attempts, many=True)

            # Reuse unattempted logic
            assignments = TestAssignment.objects.filter(test_id__in=test_ids)
            unattempted_data = []

            for assignment in assignments:
                for student_id in assignment.assigned_to:
                    has_attempted = attempts.filter(test=assignment.test, student_id=student_id).exists()
                    if not has_attempted:
                        unattempted_data.append({
                            "test_id": assignment.test.id,
                            "test_title": assignment.test.title,
                            "student_id": student_id
                        })

            return Response({
                "status": "all",
                "attempted": attempted_serializer.data,
                "unattempted": unattempted_data
            }, status=status.HTTP_200_OK)


class StudentTestAttemptDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, test_id):
        student = request.user
        attempt = StudentTestAttempt.objects.filter(test__id=test_id, student=student).order_by('-attempted_at').first()
        if not attempt:
            return Response({"detail": "Attempt not found."}, status=404)

        answers = attempt.answers  # Example: {"12": 2, "13": 0}
        question_ids = [int(qid) for qid in answers.keys()]
        questions = Question.objects.filter(id__in=question_ids)
        question_map = {q.id: q for q in questions}

        response_times = attempt.response_times if isinstance(attempt.response_times, dict) else {}


        print("Attempt: ",response_times)

        details = []
        for qid_str, selected_option in answers.items():
            qid = int(qid_str)
            question = question_map.get(qid)
            if not question:
                continue

            detail = {
                "question_id": question.id,
                "question_text": question.question,
                "options": question.options,
                "correct_option": question.correct_answer,
                "selected_option": selected_option,
                "is_correct": selected_option == question.correct_answer,
                "time_taken": response_times.get(qid_str)
            }
            details.append(detail)

        serializer = StudentAttemptQuestionDetailSerializer(details, many=True)
        return Response({
            "attempt_id": attempt.id,
            "test_title": attempt.test.title,
            "score": attempt.score,
            "correct_answers": attempt.correct_answers,
            "total_questions": attempt.total_questions,
            "passed": attempt.passed,
            "attempted_at": attempt.attempted_at,
            "questions": serializer.data
        })



class StudentSubjectPerformance(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        attempts = StudentTestAttempt.objects.filter(student=user, deleted_at__isnull=True)

        data = (
            attempts.values('test__subject')
            .annotate(
                average_score=Avg('score'),
                total_attempts=Count('id')
            )
            .order_by('-total_attempts')
        )

        return Response(data)
    

class StudentMonthlyAnalytics(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        attempts = StudentTestAttempt.objects.filter(student=user, deleted_at__isnull=True)

        data = (
            attempts.annotate(month=TruncMonth('attempted_at'))
            .values('month')
            .annotate(
                tests_attempted=Count('id'),
                average_score=Avg('score')
            )
            .order_by('month')
        )

        return Response(data)

class TestFeedbackView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Only students can request feedback
        if request.user.role != 'student':
            raise PermissionDenied("Only students can request feedback")

        attempt_id = request.data.get('attempt')
        feedback_text = request.data.get('feedback_text')

        if not attempt_id or not feedback_text:
            return Response(
                {"error": "Both attempt ID and feedback text are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            attempt = StudentTestAttempt.objects.get(id=attempt_id)
            
            # Verify the attempt belongs to the student
            if attempt.student != request.user:
                raise PermissionDenied("You can only request feedback for your own attempts")

            # Check if there's an assignment for this test
            assignment = TestAssignment.objects.filter(
                test=attempt.test,
                assigned_to__contains=[request.user.id]
            ).first()

            if not assignment:
                return Response(
                    {"error": "No assignment found for this test"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create feedback request
            feedback = TestFeedback.objects.create(
                attempt=attempt,
                student=request.user,
                comments=feedback_text,
                status='pending'
            )

            serializer = TestFeedbackSerializer(feedback)
            return Response({
                "message": "Feedback request submitted successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)

        except StudentTestAttempt.DoesNotExist:
            return Response(
                {"error": "Test attempt not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class StudentFeedbackListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == 'student':
            # Get feedback requests made by the student
            feedbacks = TestFeedback.objects.filter(student=request.user)
        elif request.user.role == 'teacher':
            # Get feedback requests for tests created by the teacher
            feedbacks = TestFeedback.objects.filter(
                attempt__test__created_by=request.user
            ).select_related('student', 'attempt', 'attempt__test')
        else:
            raise PermissionDenied("Invalid user role")

        serializer = TestFeedbackSerializer(feedbacks, many=True)
        return Response(serializer.data)

class MarkFeedbackAsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, feedback_id):
        try:
            feedback = TestFeedback.objects.get(id=feedback_id)
            # Only the student who received the feedback can mark it as read
            if request.user.role == 'student' and feedback.attempt.student == request.user:
                feedback.is_read = True
                feedback.save()
                return Response({"message": "Feedback marked as read"})
            raise PermissionDenied("You don't have permission to mark this feedback as read")
        except TestFeedback.DoesNotExist:
            return Response({"error": "Feedback not found"}, status=status.HTTP_404_NOT_FOUND)

class TestAttemptsListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == 'teacher':
            # Get all attempts for tests created by this teacher
            attempts = StudentTestAttempt.objects.filter(
                test__created_by=request.user
            ).select_related('student', 'test', 'student__profile')
        else:
            # Students can only see their own attempts
            attempts = StudentTestAttempt.objects.filter(
                student=request.user
            ).select_related('test')

        serializer = AttemptedTestWithStudentSerializer(attempts, many=True)
        return Response(serializer.data)

class TestAttemptsByTestView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, test_id):
        if request.user.role == 'teacher':
            # Get all attempts for this specific test
            attempts = StudentTestAttempt.objects.filter(
                test_id=test_id,
                test__created_by=request.user
            ).select_related('student', 'test', 'student__profile')
        else:
            # Students can only see their own attempts for this test
            attempts = StudentTestAttempt.objects.filter(
                test_id=test_id,
                student=request.user
            ).select_related('test')

        serializer = AttemptedTestWithStudentSerializer(attempts, many=True)
        return Response(serializer.data)

class TeacherFeedbackListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'teacher':
            raise PermissionDenied("Only teachers can view feedback list")

        # Get all feedback for tests created by this teacher
        feedbacks = TestFeedback.objects.filter(
            attempt__test__created_by=request.user
        ).select_related(
            'attempt__test',
            'student__profile'
        ).order_by('-created_at')

        serializer = TestFeedbackSerializer(feedbacks, many=True)
        return Response(serializer.data)

class PracticeSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Only students can create practice sessions
        if request.user.role != 'student':
            return Response(
                {"error": "Only students can create practice sessions"},
                status=status.HTTP_403_FORBIDDEN
            )

        input_text = request.data.get('input_text')
        if not input_text:
            return Response(
                {"error": "Input text is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create practice session
        practice_session = PracticeSession.objects.create(
            student=request.user,
            input_text=input_text,
            status='pending'
        )

        # Start processing in background
        thread = threading.Thread(
            target=self.process_practice_session,
            args=(practice_session.id,)
        )
        thread.start()

        serializer = PracticeSessionSerializer(practice_session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get(self, request):
        # Get all practice sessions for the student
        practice_sessions = PracticeSession.objects.filter(
            student=request.user
        ).order_by('-created_at')
        
        serializer = PracticeSessionSerializer(practice_sessions, many=True)
        return Response(serializer.data)

    def process_practice_session(self, session_id):
        try:
            session = PracticeSession.objects.get(id=session_id)
            session.status = 'processing'
            session.save()

            # Call RapidAPI's Claude 3 for text processing
            url = "https://open-ai21.p.rapidapi.com/claude3"
            
            # First prompt for summarization
            summary_prompt = f"""Please analyze the following text and provide:
1. A concise summary (2-3 sentences)
2. Key points (5-7 bullet points)
3. Important concepts to remember

Text: {session.input_text}"""

            # Second prompt for MCQ generation
            mcq_prompt = f"""Generate 5 multiple-choice questions (MCQs) with 4 options each and the correct answer marked clearly from the following text:

{session.input_text}

Format each question as:
Q1. [Question text]
A. [Option A]
B. [Option B]
C. [Option C]
D. [Option D]
Answer: [Correct option letter]"""

            headers = {
                "x-rapidapi-key": settings.RAPIDAPI_KEY,
                "x-rapidapi-host": "open-ai21.p.rapidapi.com",
                "Content-Type": "application/json"
            }

            # Get summary
            summary_payload = {
                "messages": [{"role": "user", "content": summary_prompt}],
                "web_access": False
            }
            summary_response = requests.post(url, json=summary_payload, headers=headers)
            
            if summary_response.status_code != 200:
                raise Exception(f"Summary generation failed: {summary_response.text}")

            # Get MCQs
            mcq_payload = {
                "messages": [{"role": "user", "content": mcq_prompt}],
                "web_access": False
            }
            mcq_response = requests.post(url, json=mcq_payload, headers=headers)
            
            if mcq_response.status_code != 200:
                raise Exception(f"MCQ generation failed: {mcq_response.text}")

            # Process summary response
            summary_text = summary_response.json().get("result", "").strip()
            summary_points = summary_text.split('\n')

            # Process MCQ response
            mcq_text = mcq_response.json().get("result", "").strip()
            questions = mcq_text.split('Q')[1:]  # Split by question
            mcq_list = []

            for q in questions:
                lines = q.strip().split('\n')
                question_text = lines[0].strip()
                options = [line[2:].strip() for line in lines[1:5] if line.startswith(tuple("ABCD"))]
                answer_line = next((line for line in lines if line.lower().startswith("answer:")), "")
                correct_answer = answer_line.split(":", 1)[-1].strip()
                
                if len(options) == 4 and question_text:
                    mcq_list.append({
                        "question_text": question_text,
                        "options": options,
                        "correct_answer": correct_answer
                    })

            # Update session with results
            session.summary_points = summary_points
            session.generated_questions = mcq_list
            session.status = 'completed'
            session.save()

        except Exception as e:
            session.status = 'failed'
            session.error_message = str(e)
            session.save()

class PracticeSessionCallbackView(APIView):
    def post(self, request, session_id):
        try:
            session = get_object_or_404(PracticeSession, id=session_id)
            
            # Update session with results
            session.summary_points = request.data.get('summary_points', [])
            session.generated_questions = request.data.get('generated_questions', [])
            session.status = 'completed'
            session.save()

            return Response({"status": "success"})

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class PracticeSessionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        session = get_object_or_404(PracticeSession, id=session_id)
        
        # Check if the session belongs to the user
        if session.student != request.user:
            return Response(
                {"error": "You don't have permission to view this session"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = PracticeSessionSerializer(session)
        return Response(serializer.data)

