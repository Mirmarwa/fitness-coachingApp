from django.contrib import admin
from .models import Program, Enrollment, Exercise, NutritionPlan, Progress

admin.site.register(Progress)
admin.site.register(NutritionPlan)
admin.site.register(Exercise)

admin.site.register(Program)
admin.site.register(Enrollment)


