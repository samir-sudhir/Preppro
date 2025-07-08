from rest_framework import serializers
from .models import Test, TestQuestion, TestAssignment, StudentTestAttempt, TestFeedback, PracticeSession
from questions.models import Question
from users.models import User
from users.serializers import UserSerializer

# Serializer for TestQuestion
class TestQuestionSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source="question.question", read_only=True)  # Get question text

    class Meta:
        model = TestQuestion
        fields = ['id', 'test', 'question', 'question_text']


# Serializer for Test (Includes test questions)
class TestSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField()  # Show teacher's username

    class Meta:
        model = Test
        fields = [
            'id', 'created_by', 'title', 'description', 'duration',
            'total_marks', 'passing_marks', 'subject', 'topic',
            'difficulty', 'instructions', 'is_published',
            'created_at', 'updated_at', 'deleted_at','test_questions'
        ]
        extra_kwargs = {
            'created_by': {'read_only': True}
        }

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['created_by'] = request.user
        return super().create(validated_data)



# Serializer for Test Assignment
class TestAssignmentSerializer(serializers.ModelSerializer):
    assigned_by = serializers.StringRelatedField(read_only=True)  # Show teacher's username
    assigned_to = serializers.ListField(child=serializers.IntegerField())  # Store list of student IDs

    class Meta:
        model = TestAssignment
        fields = '__all__'
        read_only_fields = ['assigned_by']

    def validate_assigned_to(self, value):
        """Ensure assigned_to only contains valid student IDs"""
        if not all(isinstance(student_id, int) for student_id in value):
            raise serializers.ValidationError("assigned_to must be a list of student IDs.")
        return value


# Serializer for Student Test Attempt
class StudentTestAttemptSerializer(serializers.ModelSerializer):
    student = serializers.StringRelatedField()  # Show student's username
    test_title = serializers.CharField(source="test.title", read_only=True)  # Show test title

    class Meta:
        model = StudentTestAttempt
        fields = '__all__'


# Serializer for Student Test Attempt with nested student details
class AttemptedTestWithStudentSerializer(serializers.ModelSerializer):
    student = serializers.SerializerMethodField()
    test_title = serializers.CharField(source="test.title", read_only=True)

    class Meta:
        model = StudentTestAttempt
        fields = ['id', 'student', 'test', 'test_title', 'answers', 'score', 'correct_answers', 'total_questions', 'response_times', 'passed', 'attempted_at']

    def get_student(self, obj):
        user = obj.student
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }


class TestFeedbackSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    test_title = serializers.SerializerMethodField()

    class Meta:
        model = TestFeedback
        fields = [
            'id', 'attempt', 'student', 'student_name', 
            'comments', 'created_at', 'updated_at', 
            'is_read', 'status', 'teacher_response', 
            'response_date', 'test_title'
        ]

    def get_student_name(self, obj):
        return f"{obj.student.profile.first_name} {obj.student.profile.last_name}"

    def get_test_title(self, obj):
        return obj.attempt.test.title

    def validate(self, data):
        attempt = data['attempt']
        if attempt.test.show_results != 'after_submission':
            raise serializers.ValidationError(
                "Feedback can only be provided for tests with 'after_submission' result display"
            )
        return data


class TestQuestionSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source="question.question", read_only=True)  # Access question text
    options = serializers.JSONField(source="question.options", read_only=True)  # Access options from related Question
    correct_answer = serializers.CharField(source="question.correct_answer", read_only=True)  # Access correct answer

    class Meta:
        model = TestQuestion
        fields = ['id', 'test', 'question', 'question_text', 'options', 'correct_answer']


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'question', 'options', 'correct_answer']
        
class StudentAttemptQuestionDetailSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    question_text = serializers.CharField()
    options = serializers.ListField(child=serializers.CharField())
    correct_option = serializers.IntegerField()
    selected_option = serializers.IntegerField()
    is_correct = serializers.BooleanField()
    time_taken = serializers.FloatField(allow_null=True)


class PracticeSessionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = PracticeSession
        fields = [
            'id', 'student', 'student_name', 'input_text', 
            'summary_points', 'generated_questions', 'status',
            'created_at', 'updated_at', 'error_message'
        ]
        read_only_fields = ['student', 'summary_points', 'generated_questions', 'status', 'error_message']

    def get_student_name(self, obj):
        return f"{obj.student.profile.first_name} {obj.student.profile.last_name}"

