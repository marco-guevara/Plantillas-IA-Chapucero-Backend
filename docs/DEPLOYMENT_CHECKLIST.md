# Deployment checklist

## Backend

1. Crear proyecto Supabase y copiar `DATABASE_URL`.
2. Ejecutar migraciones con `npm run db:migrate`.
3. Confirmar estado con `npm run db:status`.
4. Configurar variables del backend en Vercel:
   - `NODE_ENV=production`
   - `TRUST_PROXY=true`
   - `DATABASE_URL`
   - `DATABASE_SSL=true`
   - `DATABASE_REQUIRED=true`
   - `WEBHOOK_AUDIT_ENABLED=true`
   - `CORS_ORIGINS=https://tu-frontend.vercel.app`
   - `COOKIE_SECURE=true`
   - `CSRF_REQUIRED=true`
   - `COOKIE_DOMAIN=` si front y back no comparten dominio padre
   - `REQUIRE_AUTH_FOR_API=true`
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `N8N_URL`
   - `HOSTINGER_UPLOAD_URL`
   - `WEBHOOK_TIMEOUT_MS=25000`
   - `WEBHOOK_RETRY_ATTEMPTS=1`
5. Crear primer cliente admin:
   - local contra Supabase: `npm run db:create-admin`
   - o una seed temporal controlada, nunca desde endpoint publico.
6. Validar:
   - `GET /api/health`
   - `GET /api/health/ready`
   - `checks.database.migrations.tableReady=true`

## Frontend

1. Configurar variables del frontend en Vercel:
   - `VITE_DATA_SOURCE=backend`
   - `VITE_API_BASE_URL=https://tu-backend.vercel.app/api`
   - conservar variables legacy mientras n8n siga como respaldo.
2. Confirmar que las llamadas usen cookies con `credentials: include`.
3. Pedir `GET /auth/csrf` y enviar `x-csrf-token` en llamadas mutantes.
4. Adaptar auth siguiendo `docs/AUTH_FRONTEND_CONTRACT.md`.
5. Validar flujos principales:
   - login
   - cola por categoria
   - guardado
   - generacion 9:16 y 3:4
   - publicacion
   - descarga

## Estado actual

Todavia falta configurar Supabase real, variables de Vercel y adaptar el frontend a cookies/JWT antes de considerar el despliegue completo listo.
