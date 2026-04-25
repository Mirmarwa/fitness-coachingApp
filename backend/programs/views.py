from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Program
from .serializers import ProgramSerializer

@api_view(['GET'])
def get_programs(request):
    programs = Program.objects.all()
    serializer = ProgramSerializer(programs, many=True)
    return Response(serializer.data)
<<<<<<< HEAD

@api_view(['GET'])
def get_program_detail(request, id):
    program = Program.objects.get(id=id)
    serializer = ProgramSerializer(program)
    return Response(serializer.data)
=======
from rest_framework import viewsets
from .models import Program
from .serializers import ProgramSerializer


class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
>>>>>>> 1e52c4f (backend API completed with DRF (users, coaches, programs, payments))
