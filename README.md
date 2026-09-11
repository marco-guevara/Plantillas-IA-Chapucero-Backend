# Laminas IA 2026 Backend

API Node/Express para autenticacion de clientes, PostgreSQL con Sequelize y capa compatible con los webhooks legacy de n8n.

## Arranque local

```bash
npm install
cp .env.example .env
npm run dev
```

La API arranca por defecto en `http://localhost:4000`.

Cuando el frontend pase a consumir esta API, `VITE_API_BASE_URL` debe apuntar a `http://localhost:4000/api` en local o `https://tu-api.vercel.app/api` en despliegue.

## Variables importantes

- `DATABASE_URL`: conexion PostgreSQL local o Supabase.
- `DATABASE_SSL`: usar `true` para Supabase.
- `CORS_ORIGINS`: frontend local y dominio de Vercel separados por coma.
- `JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET`: secretos largos y distintos.
- `N8N_URL`: host base de n8n, sin `/webhook` al final.
- `HOSTINGER_UPLOAD_URL`: endpoint legacy de subida de assets.
- `WEBHOOK_TIMEOUT_MS`: maximo tiempo de espera por llamada n8n/Hostinger.
- `WEBHOOK_RETRY_ATTEMPTS`: reintentos para timeouts, errores de red y respuestas 5xx.
- `WEBHOOK_AUDIT_ENABLED`: guarda auditoria de llamadas n8n en PostgreSQL. En local puede quedar en `false`; en produccion conviene activarlo cuando la DB este lista.
- `TRUST_PROXY`: usar `true` en Vercel/produccion para IP real y cookies seguras detras de proxy.
- `RATE_LIMIT_*`: limites por IP para trafico global, auth y llamadas workflow.

## Scripts

- `npm run dev`: API con `node --watch`.
- `npm start`: API en modo Node.
- `npm run check`: validacion rapida de sintaxis.
- `npm run db:migrate`: ejecuta migraciones SQL pendientes con tabla `schema_migrations`.
- `npm run db:status`: muestra migraciones aplicadas y pendientes.
- `npm run db:sync`: sincroniza modelos Sequelize sin `alter`.
- `npm run db:create-admin`: crea o actualiza el primer cliente admin desde `.env`.

Si Windows bloquea el modo watch con `spawn EPERM`, usar `npm start` para levantar la API sin recarga automatica.

## Endpoints iniciales

- `GET /api/health`
- `GET /api/health/ready`
- `GET /api/auth/csrf`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `GET /api/auth/sessions`
- `DELETE /api/auth/sessions/:id`
- `GET /api/clients`
- `POST /api/clients`
- `PATCH /api/clients/:id`
- `GET /api/laminas/queue/:category`
- `GET /api/laminas/history`
- `GET /api/laminas/history/:id`
- `PATCH /api/laminas/texts/:category`
- `POST /api/laminas/:category`
- `POST /api/laminas/generate/:format`
- `POST /api/laminas/downloads`
- `POST /api/images/search`
- `POST /api/assets/upload`
- `POST /api/publishing/:network`

Las rutas de negocio pasan por `REQUIRE_AUTH_FOR_API=true` por defecto. El frontend debera usar cookies con `credentials: include` cuando activemos la conexion real contra esta API.

En produccion, las llamadas `POST`, `PATCH` y `DELETE` deben enviar `x-csrf-token`; ver `docs/AUTH_FRONTEND_CONTRACT.md`.

La API mantiene compatibilidad con n8n y, cuando PostgreSQL esta disponible, guarda historico local de guardados, generaciones, assets subidos y publicaciones. Esa persistencia es best effort: si la DB local aun no esta levantada, no debe bloquear la llamada legacy.

Los endpoints validan parametros y cuerpo JSON antes de llamar a n8n, pero mantienen flexibles los campos internos de los payloads legacy documentados.

La administracion de clientes revoca sesiones al resetear password o desactivar cuentas, y protege que siempre exista al menos un admin activo.

## Supabase

Para Supabase:

1. Crear el proyecto PostgreSQL.
2. Copiar la cadena de conexion en `DATABASE_URL`.
3. Usar `DATABASE_SSL=true`.
4. Ejecutar migraciones con `npm run db:migrate`.
5. Crear el primer cliente con `npm run db:create-admin`.

## Despliegue

El backend incluye `api/index.js` y `vercel.json` para ejecutarse como API en Vercel. Antes de desplegar front + back, revisar `docs/DEPLOYMENT_CHECKLIST.md` y confirmar que `GET /api/health/ready` responde `ok: true` en produccion.

Para conectar auth desde React, seguir `docs/AUTH_FRONTEND_CONTRACT.md`.

## Modelo de datos

- `clients`: credenciales y permisos de clientes.
- `client_sessions`: refresh tokens revocables para cookies/JWT.
- `laminas`: historico principal de laminas, categoria, URLs generadas y payload estable.
- `lamina_assets`: imagen principal, composiciones, subidas y variantes.
- `publish_jobs`: intentos de publicacion por red social.
- `webhook_events`: auditoria de llamadas hacia n8n/Hostinger con payloads saneados.

## Contratos

Los endpoints de laminas actuan como puente compatible hacia n8n. Antes de cambiar nombres de webhooks, payloads o formas de respuesta, revisar los documentos del frontend:

- `docs/N8N_CONTRACTS.md`
- `docs/FRONTEND_API_PORT.md`
- `docs/BACKEND_ROADMAP.md`
