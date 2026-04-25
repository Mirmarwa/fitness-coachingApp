
<<<<<<< HEAD
from rest_framework import serializers
from .models import Program, Exercise, NutritionPlan
class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = '__all__'  

class NutritionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = NutritionPlan
        fields = '__all__'
        
=======

>>>>>>> 1e52c4f (backend API completed with DRF (users, coaches, programs, payments))
class ProgramSerializer(serializers.ModelSerializer):
    exercises = ExerciseSerializer(many=True, read_only=True)
    nutrition_plans = NutritionPlanSerializer(many=True, read_only=True)

    class Meta:
        model = Program
        fields = '__all__'
