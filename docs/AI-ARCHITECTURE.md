# Arquitectura recomendada para IA

Frontend GitHub Pages
        ↓ HTTPS
Serverless Function
        ↓
OpenAI API
        ↓
JSON validado
        ↓
Frontend

Nunca:

Frontend
   ↓
OPENAI_API_KEY

La clave siempre debe estar en una variable secreta del backend.

Variables recomendadas del backend:
- OPENAI_API_KEY
- OPENAI_MODEL

El frontend ya contempla `/api/ai/plan` como endpoint configurable.
