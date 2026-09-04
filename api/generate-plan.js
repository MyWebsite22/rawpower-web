const { GoogleGenAI } = require('@google/genai');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { profile, history } = req.body;
    
    // Initialize Google Gen AI with the API key from Vercel environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not set on the server.' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
Eres un entrenador personal de élite, nutricionista y especialista en recomposición corporal estilo Apple Fitness+. 
Diseña un plan de entrenamiento y nutrición hiper-personalizado basado en el siguiente perfil de usuario.

PERFIL DEL USUARIO:
Nombre: ${profile.name || 'Atleta'}
Edad: ${profile.age || 'No especificada'}
Género: ${profile.gender || 'No especificado'}
Peso actual: ${profile.weight || 'No especificado'} kg
Estatura: ${profile.height || 'No especificada'} cm
Objetivo principal: ${profile.goal || 'Recomposición corporal'}
Nivel de experiencia: ${profile.level || 'Principiante'}
Días disponibles por semana: ${profile.days || 4}
Minutos por sesión: ${profile.minutes || 45}
Lugar de entrenamiento: ${profile.space || 'Mixto'}
Equipamiento disponible: ${profile.equipment ? profile.equipment.join(', ') : 'Peso corporal'}
Enfoque muscular/Prioridades: ${profile.focus ? profile.focus.join(', ') : 'Cuerpo completo'}

NUTRICIÓN:
Tipo de dieta: ${profile.diet || 'Omnívora'}
Comidas por día: ${profile.meals || 4}
Ingredientes disponibles: ${profile.ingredients ? profile.ingredients.join(', ') : 'Libre'}
Alergias o evitar: ${profile.avoid ? profile.avoid.join(', ') : 'Ninguna'}

CONSIDERACIONES MÉDICAS:
${profile.limitations || 'Ninguna indicada.'}

HISTORIAL RECIENTE:
${history ? JSON.stringify(history) : 'Sin datos recientes.'}

FORMATO DE RESPUESTA REQUERIDO (DEBES devolver ÚNICAMENTE un objeto JSON válido, sin formato de markdown extra ni comillas invertidas):

{
  "summary": "Un párrafo motivador y elegante sobre cómo este plan se adapta a la vida del usuario (estilo Apple).",
  "safety": "Aviso de seguridad breve.",
  "weeklyTraining": [
    {
      "day": "Día 1",
      "focus": "Tren superior",
      "warmup": ["Movilidad articular 3 min", "Activación ligera"],
      "exercises": [
        {
          "name": "Nombre del ejercicio",
          "primaryMuscle": "Músculo",
          "sets": "3",
          "reps": "8-12",
          "rest": "90 s",
          "rir": "1-2",
          "cues": "Instrucción técnica clave y precisa.",
          "alternative": "Alternativa fácil/sin equipo"
        }
      ],
      "cooldown": ["Estiramiento 3 min"]
    }
  ],
  "fourWeekProgression": [
    {"week": 1, "focus": "Fase 1", "changes": "Detalle"},
    {"week": 2, "focus": "Fase 2", "changes": "Detalle"},
    {"week": 3, "focus": "Fase 3", "changes": "Detalle"},
    {"week": 4, "focus": "Fase 4", "changes": "Detalle"}
  ],
  "nutrition": {
    "calorieRange": "Ej: 2000-2200 kcal",
    "proteinRange": "Ej: 130-150 g",
    "carbRange": "Ej: 200-220 g",
    "disclaimer": "Nota breve.",
    "menu": [
      {
        "day": "Lunes",
        "meals": [
          {
            "name": "Desayuno",
            "ingredients": ["Ingrediente 1", "Ingrediente 2"],
            "portion": "Tamaño de porción sugerido",
            "preparation": "Instrucciones cortas.",
            "nutrition": {"calories": "~400 kcal", "protein": "30 g"}
          }
        ]
      }
    ]
  },
  "shoppingList": ["Lista de la compra basada en sus ingredientes y menú"],
  "source": "Gemini Pro AI (Premium)"
}

Devuelve SOLO el JSON, nada más.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    });

    const planText = response.text;
    const planJSON = JSON.parse(planText);

    return res.status(200).json({ plan: planJSON });
  } catch (error) {
    console.error('Error generating plan:', error);
    return res.status(500).json({ error: 'Failed to generate AI plan. Please check logs.' });
  }
};
