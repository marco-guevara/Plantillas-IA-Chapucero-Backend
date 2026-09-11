# Auth frontend contract

Este contrato define como debe hablar el frontend React con la API cuando cambiemos de auth legacy a backend.

## Base URL

Local:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

Vercel:

```env
VITE_API_BASE_URL=https://tu-backend.vercel.app/api
```

Todas las llamadas auth deben usar cookies:

```js
fetch(url, {
  credentials: 'include',
})
```

## CSRF

Antes de cualquier `POST`, `PATCH` o `DELETE` cuando `CSRF_REQUIRED=true`, el frontend debe pedir un token:

`GET /auth/csrf`

Respuesta:

```json
{
  "ok": true,
  "csrfToken": "token"
}
```

El backend tambien setea la cookie `laminas_csrf_token`. En cada llamada mutante, enviar el token en header:

```js
fetch(url, {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': csrfToken,
  },
  body: JSON.stringify(payload),
})
```

En desarrollo podemos usar `CSRF_REQUIRED=false` para acelerar pruebas locales. En produccion debe ser `true`.

## Login

`POST /auth/login`

Payload:

```json
{
  "email": "cliente@example.com",
  "password": "password"
}
```

Respuesta:

```json
{
  "ok": true,
  "client": {
    "id": "uuid",
    "email": "cliente@example.com",
    "name": "Cliente",
    "role": "admin",
    "status": "active",
    "lastLoginAt": "2026-09-11T00:00:00.000Z"
  },
  "accessToken": "jwt"
}
```

Cookies httpOnly seteadas por backend:

- `laminas_access_token`
- `laminas_refresh_token`

Cookie legible por frontend para CSRF:

- `laminas_csrf_token`

El frontend puede guardar `client` en estado React, pero no debe guardar el refresh token.

## Sesion actual

`GET /auth/me`

Requiere cookie de access token o header `Authorization: Bearer <token>`.

Respuesta:

```json
{
  "ok": true,
  "client": {
    "id": "uuid",
    "email": "cliente@example.com",
    "name": "Cliente",
    "role": "admin",
    "status": "active",
    "lastLoginAt": "2026-09-11T00:00:00.000Z"
  }
}
```

## Refresh

`POST /auth/refresh`

Usa la cookie `laminas_refresh_token` y renueva `laminas_access_token`.

Respuesta igual a login.

## Logout

`POST /auth/logout`

Revoca la sesion en DB cuando hay refresh token valido y limpia cookies.

Respuesta:

```json
{
  "ok": true
}
```

## Sesiones activas

`GET /auth/sessions`

Respuesta:

```json
{
  "ok": true,
  "sessions": [
    {
      "id": "uuid",
      "userAgent": "Mozilla/5.0",
      "ipAddress": "127.0.0.1",
      "expiresAt": "2026-09-18T00:00:00.000Z",
      "createdAt": "2026-09-11T00:00:00.000Z"
    }
  ]
}
```

`DELETE /auth/sessions/:id`

Revoca una sesion propia.

## Roles

Roles actuales del backend:

- `admin`
- `editor`
- `viewer`

Antes de conectar el frontend hay que mapearlos con los roles legacy actuales:

- `admin`
- `emaster`
- `client`

Recomendacion de migracion: `admin -> admin`, `editor -> emaster`, `viewer -> client`, salvo que definamos permisos mas finos.

## Produccion

Para cookies cross-site entre frontend Vercel y backend Vercel:

- Backend: `COOKIE_SECURE=true`
- Backend: `TRUST_PROXY=true`
- Backend: `CORS_ORIGINS=https://tu-frontend.vercel.app`
- Frontend: todas las llamadas API con `credentials: include`

Pendiente de decidir antes de produccion: proteccion CSRF explicita para cookies cross-site.
