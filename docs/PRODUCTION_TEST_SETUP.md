# Production test setup

Orden recomendado:

1. Supabase
2. Render backend
3. Vercel frontend

## 1. Supabase

Crear un proyecto PostgreSQL en Supabase y copiar la connection string.

En el backend local, configurar temporalmente `.env` o variables de terminal con:

```env
DATABASE_URL=postgresql://postgres.nffydeuscsyzhqpxhafu:[YOUR-PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
DATABASE_SSL=true
DATABASE_REQUIRED=true
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=cambia_esta_password_larga
ADMIN_NAME=Administrador
```

Ejecutar:

```bash
npm run db:migrate
npm run db:status
npm run db:create-admin
```

## 2. Render backend

Crear Web Service apuntando al repo backend.

Build command:

```bash
npm install
```

Start command:

```bash
npm start
```

Environment variables:

Copiar las variables de `.env.render.example` en Render y sustituir:

- `DATABASE_URL`, sustituyendo `[YOUR-PASSWORD]`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `CORS_ORIGINS` si Vercel genera otro dominio. Para el entorno actual usar `https://plantillas-ia-chapucero-test.vercel.app`

Validar:

```txt
https://plantillas-ia-chapucero-backend.onrender.com/api/health
https://plantillas-ia-chapucero-backend.onrender.com/api/health/ready
```

## 3. Vercel frontend

Crear proyecto Vercel apuntando al repo frontend.

Build command:

```bash
npm run build
```

Output directory:

```txt
dist
```

Environment variables:

Copiar las variables de `.env.vercel.example` del frontend.

Para esta primera prueba productiva, usar:

```env
VITE_DATA_SOURCE=legacy
```

Cuando conectemos auth/cookies/CSRF en React, cambiaremos a:

```env
VITE_DATA_SOURCE=backend
```
