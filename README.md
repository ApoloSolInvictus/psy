# PSY

PSY es una web app MVP de apoyo emocional diario con chats de IA en español, check-ins, ejercicios, plan de prevención de crisis y avisos claros de seguridad.

PSY no reemplaza psicólogos, psiquiatras, médicos, servicios de emergencia ni tratamiento profesional. En crisis, la app prioriza seguridad inmediata.

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui base
- Supabase Auth, Database y Storage
- OpenAI Responses API
- PayPal stubs para segunda pasada
- ESLint + Prettier

## Instalación

Recomendado: Node.js 20.9 o superior.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abre `http://localhost:3000`.

## Variables de entorno en Vercel

Configura estas variables en Project Settings > Environment Variables:

```env
NEXT_PUBLIC_APP_URL=https://psy.infiniti-ia.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.2
```

`OPENAI_MODEL` no se descarga desde otro lugar: es el nombre del modelo que quieres usar en la API de OpenAI. `NEXT_PUBLIC_APP_URL` es la URL publica de la app desplegada; en produccion de PSY debe apuntar al dominio real.

## Supabase

1. Crea un proyecto en Supabase.
2. Copia `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en `.env.local`.
3. Ejecuta `supabase/schema.sql` en el SQL Editor.
4. En Auth, configura la URL del sitio y redirects hacia:

```text
http://localhost:3000/auth/confirm
https://tu-dominio.vercel.app/auth/confirm
```

El SQL incluye RLS y `GRANT` explícitos para proyectos nuevos donde las tablas ya no se exponen automáticamente al Data API.
También crea perfiles para usuarios ya existentes, inserta personajes/ejercicios iniciales y deja el bucket `avatars` sin política pública amplia sobre `storage.objects`.

## OpenAI

Agrega:

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.2
```

`/api/chat` usa un detector local de crisis antes de llamar a OpenAI. Si detecta autolesión, suicidio, daño a terceros, abuso, emergencia médica, psicosis intensa o pérdida de control, responde con un mensaje de seguridad y no continúa como chat normal.

## PayPal

Los endpoints existen como stubs:

- `POST /api/paypal/create-subscription`
- `POST /api/paypal/webhook`

Segunda pasada:

- Crear producto y plan en PayPal.
- Generar approval URL.
- Verificar webhook signature.
- Actualizar `subscriptions`.
- Aplicar límites premium en `/api/chat`.

## Rutas

- `/`
- `/login`
- `/register`
- `/dashboard`
- `/chat`
- `/chat/[conversationId]`
- `/characters`
- `/checkin`
- `/exercises`
- `/crisis-plan`
- `/billing`
- `/privacy`
- `/terms`

## Seguridad y privacidad

- La IA no diagnostica, receta, modifica medicación ni sustituye atención profesional.
- En crisis se recomienda emergencias locales o una persona de confianza.
- Se guardan datos mínimos para operar: perfil, conversaciones, check-ins, ejercicios, plan y suscripción.
- No se venden datos sensibles.

## TODO producción

- Revisión clínica y legal.
- Moderación avanzada y evaluación de seguridad con casos de prueba.
- Rate limits por usuario/IP.
- Retención, exportación y eliminación de datos.
- Cifrado adicional para campos sensibles si aplica.
- Avatar upload UI con Supabase Storage.
- PayPal real con verificación de webhooks.
- Activar leaked password protection en Supabase Auth.
- Observabilidad sin registrar contenido sensible innecesario.
- Tests unitarios, integración y RLS.
