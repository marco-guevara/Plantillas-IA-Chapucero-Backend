# Deployment checklist

## Backend

1. Crear proyecto Supabase y copiar `DATABASE_URL`.
2. Ejecutar las migraciones SQL en este orden:
   - `src/db/migrations/001-create-auth-tables.sql`
   - `src/db/migrations/002-create-lamina-domain-tables.sql`
3. Configurar variables del backend en Vercel:
   - `NODE_ENV=production`
   - `TRUST_PROXY=true`
   - `DATABASE_URL`
   - `DATABASE_SSL=true`
   - `DATABASE_REQUIRED=true`
   - `WEBHOOK_AUDIT_ENABLED=true`
   - `CORS_ORIGINS=https://tu-frontend.vercel.app`
   - `COOKIE_SECURE=true`
   - `COOKIE_DOMAIN=` si front y back no comparten dominio padre
   - `REQUIRE_AUTH_FOR_API=true`
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `N8N_URL`
   - `HOSTINGER_UPLOAD_URL`
4. Crear primer cliente admin:
   - local contra Supabase: `npm run db:create-admin`
   - o una seed temporal controlada, nunca desde endpoint publico.
5. Validar:
   - `GET /api/health`
   - `GET /api/health/ready`

## Frontend

1. Configurar variables del frontend en Vercel:
   - `VITE_DATA_SOURCE=backend`
   - `VITE_API_BASE_URL=https://tu-backend.vercel.app/api`
   - conservar variables legacy mientras n8n siga como respaldo.
2. Confirmar que las llamadas usen cookies con `credentials: include` antes de activar auth real en produccion.
3. Adaptar auth siguiendo `docs/AUTH_FRONTEND_CONTRACT.md`.
4. Validar flujos principales:
   - login
   - cola por categoria
   - guardado
   - generacion 9:16 y 3:4
   - publicacion
   - descarga

## Estado actual

Todavia falta configurar Supabase real, variables de Vercel y adaptar el frontend a cookies/JWT antes de considerar el despliegue completo listo.
