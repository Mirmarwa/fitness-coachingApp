from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Program, Exercise, NutritionPlan
from .serializers import ProgramSerializer
from users.models import CustomUser


class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer

    # ---------------- SEED DATA ----------------
    @action(detail=False, methods=['get'], url_path='seed')
    def seed(self, request):

        # Get a coach (required because Program has NOT NULL FK)
        coach = CustomUser.objects.first()

        if not coach:
            return Response(
                {"error": "No coach user found. Create a user first."},
                status=400
            )

        # Programs
        p1, _ = Program.objects.get_or_create(
            title="Prise de masse",
            coach=coach,
            defaults={
                "description": "Programme prise de masse",
                "duration": 30,
            }
        )

        p2, _ = Program.objects.get_or_create(
            title="Perte de poids",
            coach=coach,
            defaults={
                "description": "Programme perte de poids",
                "duration": 30,
            }
        )

        p3, _ = Program.objects.get_or_create(
            title="Débutant",
            coach=coach,
            defaults={
                "description": "Programme débutant",
                "duration": 20,
            }
        )

        # Exercises
        Exercise.objects.get_or_create(
            name="Squat",
            program=p1,
            defaults={
                "description": "Basic squat",
                "reps": 12,
                "sets": 3
            }
        )

        Exercise.objects.get_or_create(
            name="Push-up",
            program=p1,
            defaults={
                "description": "Push ups",
                "reps": 15,
                "sets": 3
            }
        )

        Exercise.objects.get_or_create(
            name="Deadlift",
            program=p2,
            defaults={
                "description": "Deadlift",
                "reps": 10,
                "sets": 4
            }
        )

        # Nutrition plans
        NutritionPlan.objects.get_or_create(
            title="Diet 2000 kcal",
            program=p1,
            defaults={
                "calories": 2000,
                "protein": 120,
                "carbs": 200,
                "fats": 60
            }
        )

        NutritionPlan.objects.get_or_create(
            title="Diet 2500 kcal",
            program=p2,
            defaults={
                "calories": 2500,
                "protein": 140,
                "carbs": 250,
                "fats": 80
            }
        )

        return Response({"message": "Database seeded successfully"})

    # ---------------- FULL PROGRAM ----------------
    @action(detail=True, methods=['get'])
    def full(self, request, pk=None):
        program = self.get_object()

        return Response({
            "program": ProgramSerializer(program).data,
            "exercises": program.exercises.all().values(),
            "nutrition": program.nutrition_plans.all().values()
        })
@action(detail=False, methods=['get'], url_path='generate-program')
def generate_program(self, request):

    data = {
        "program": "Muscle Gain",
        "exercises": ["Squat", "Bench Press"],
        "nutrition": "3000 kcal"
    }

    return Response(data)