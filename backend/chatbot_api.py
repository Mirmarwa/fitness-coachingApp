import json
import logging
import os

import requests
from requests.exceptions import RequestException

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

logger = logging.getLogger(__name__)
GEMINI_MODEL = "gemini-1.5-flash"
GEMINI_PROMPT = (
    "Tu es l’assistant IA de FitCoach. Réponds uniquement aux sujets fitness, nutrition, sport, motivation "
    "et coaching sportif. Réponses courtes, utiles et motivantes. Garde un ton encourageant, précis et professionnel."
)


class ChatbotAPIView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request, *args, **kwargs):
        user_message = request.data.get("message", "")
        if not isinstance(user_message, str) or not user_message.strip():
            return Response({"error": "Message requis."}, status=status.HTTP_400_BAD_REQUEST)

        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.error(
                "GEMINI_API_KEY introuvable. Vérifie que .env est chargé et que la variable existe dans l'environnement."
            )
            return Response(
                {
                    "error": "Gemini API key non configurée.",
                    "detail": "Définis GEMINI_API_KEY dans l'environnement ou dans backend/.env.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        prompt_text = f"{GEMINI_PROMPT}\n\nUtilisateur : {user_message.strip()}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt_text,
                        }
                    ]
                }
            ],
            "temperature": 0.35,
            "topP": 0.95,
            "candidateCount": 1,
            "maxOutputTokens": 250,
        }

        headers = {
            "Content-Type": "application/json",
        }

        try:
            response = requests.post(endpoint, json=payload, headers=headers, timeout=30)
            logger.debug("Gemini request status_code=%s", response.status_code)
            logger.debug("Gemini response body=%s", response.text)
        except RequestException as exc:
            logger.exception("Impossible de contacter l’API Gemini: %s", exc)
            return Response(
                {
                    "error": "Impossible de contacter l’API Gemini.",
                    "detail": str(exc),
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        if not response.ok:
            logger.error(
                "Gemini API retourne un code %s: %s",
                response.status_code,
                response.text,
            )
            return Response(
                {
                    "error": "Erreur Gemini API.",
                    "status_code": response.status_code,
                    "detail": response.text,
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        try:
            data = response.json()
        except json.JSONDecodeError as exc:
            logger.exception("Réponse JSON invalide de Gemini: %s", exc)
            return Response(
                {"error": "Réponse invalide de Gemini.", "detail": str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        answer = ""

        def extract_text(item):
            if isinstance(item, dict):
                if "text" in item and isinstance(item["text"], str):
                    return item["text"]
                if "contents" in item:
                    return "".join(extract_text(c) for c in item["contents"])
                if "content" in item:
                    return "".join(extract_text(c) for c in item["content"])
            return ""

        for candidate in data.get("candidates", []):
            answer += extract_text(candidate)

        if not answer:
            answer += extract_text(data.get("message", {}))

        if not answer:
            answer = "Désolé, je n’ai pas de réponse pour le moment. Essaie une autre question fitness."

        return Response({"answer": answer.strip()})
