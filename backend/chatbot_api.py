import os
import requests

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

MODEL = "openai/gpt-3.5-turbo"


class ChatbotAPIView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        message = request.data.get("message", "").strip()

        if not message:
            return Response(
                {"answer": "Message requis."},
                status=status.HTTP_400_BAD_REQUEST
            )

        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": """
Tu es l’assistant IA officiel de FitCoach.

Tu aides les utilisateurs sur :
- fitness
- nutrition
- motivation
- perte de poids
- prise de masse
- entraînement sportif

IMPORTANT :
- réponds naturellement
- évite de dire "Bonjour" à chaque réponse
- ne salue l’utilisateur que s’il te salue d’abord
- sois motivant et humain
- réponses courtes et utiles
- évite les réponses trop longues
- parle comme un vrai coach moderne
- reste professionnel mais chaleureux
- si une question n’est pas liée au fitness,
nutrition, sport ou santé,
réponds poliment que tu es spécialisé uniquement dans le coaching sportif
et refuse les sujets hors domaine
"""
                },
                {
                    "role": "user",
                    "content": message
                }
            ]
        }

        try:
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=30
            )

            if response.status_code != 200:
                print(response.text)

                return Response({
                    "answer": "Le chatbot est temporairement indisponible."
                })

            data = response.json()

            answer = data["choices"][0]["message"]["content"]

            return Response({"answer": answer})

        except Exception as e:
            print(e)

            return Response({
                "answer": "Le chatbot est temporairement indisponible."
            })