from django.contrib import admin
from .models import Program, Enrollment, Exercise, NutritionPlan, Progress

@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ('title', 'duration', 'coach')
    fields = ('title', 'description', 'duration', 'coach', 'image')  

admin.site.register(Enrollment)
admin.site.register(Exercise)
admin.site.register(NutritionPlan)
admin.site.register(Progress)



