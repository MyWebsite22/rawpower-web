# Adaptador IA opcional

Esta carpeta documenta el contrato recomendado para una función serverless.

POST /api/ai/plan

Body:
{
  "profile": {...},
  "history": [...]
}

Respuesta:
{
  "plan": {...}
}

La función debe leer `OPENAI_API_KEY` desde secrets del proveedor, nunca desde el frontend.
