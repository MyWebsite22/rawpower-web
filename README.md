# GATM FIT PRO — GitHub Pages Edition

GATM FIT PRO es una PWA de entrenamiento, nutrición y progreso personalizada, diseñada para publicarse directamente desde un repositorio GitHub.

## ✅ Esta edición funciona como sitio estático

No necesita Node.js para la interfaz pública.

Incluye:
- Landing premium.
- Login/registro demo local.
- Perfil completo.
- Onboarding guiado.
- Generador local de planes.
- Biblioteca de ejercicios.
- Rutinas por objetivo.
- Entrenamiento guiado.
- Temporizador de descanso.
- Nutrición.
- Recetas.
- Lista de compras.
- Seguimiento de peso y medidas.
- Rachas.
- Logros.
- Exportación/importación JSON.
- PWA.
- Tema oscuro/claro.
- Responsive para móvil, tablet y escritorio.
- Accesibilidad básica.
- SEO básico.
- GitHub Pages-ready.

## ⚠️ IA y secretos

GitHub Pages es alojamiento estático. Una `OPENAI_API_KEY` NO debe colocarse en los archivos de esta carpeta porque quedaría visible para cualquier visitante.

La interfaz incluye un adaptador preparado para una futura API segura. Para IA real usa un backend/serverless separado:

- Cloudflare Workers
- Netlify Functions
- Vercel Functions
- Supabase Edge Functions
- Render/Railway/etc.

La interfaz puede funcionar sin IA y tiene un generador local de respaldo.

## Publicar en GitHub Pages

1. Crea/sube este proyecto al repositorio.
2. En GitHub ve a `Settings → Pages`.
3. En `Build and deployment`, selecciona:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
4. Guarda.
5. GitHub te dará la URL.

Si el repositorio se llama `gatm-fit-pro`, normalmente será:

`https://TU_USUARIO.github.io/gatm-fit-pro/`

## Dominio personalizado

GitHub Pages permite conectar un dominio propio desde `Settings → Pages → Custom domain`.

## Demo

Usuario:
`gatmfree`

Contraseña:
`2210FREE`

Administrador demo:
`gatm_2210`

Contraseña:
`2210GATM`

Estas credenciales son SOLO demostración. La edición GitHub Pages no pretende ser un sistema de autenticación de producción.

## Datos

Los datos del demo/usuario se guardan localmente en el navegador mediante `localStorage`.

Usa:
- Exportar respaldo.
- Importar respaldo.

para mover el progreso entre dispositivos.

## Producción

Para convertir GATM FIT PRO en servicio real:
1. mantener esta capa como frontend;
2. añadir backend seguro;
3. usar PostgreSQL/Supabase para cuentas;
4. mover la IA al servidor;
5. incorporar autenticación real;
6. usar almacenamiento privado para fotografías;
7. añadir pagos si se comercializa PRO/PREMIUM.
