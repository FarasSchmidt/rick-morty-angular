# Rick & Morty API

Backend NestJS con conexión a MongoDB Atlas mediante Mongoose.
Incluye registro, login JWT, consulta y edición del perfil y cambio de contraseña.
Angular se conecta localmente a `http://localhost:3000/api/auth`.

## Configuración local

Entorno utilizado: Node.js 24.18.0 y npm 11.16.0. Desde esta carpeta:

```powershell
npm ci --include=dev
Copy-Item .env.example .env
```

Si `.env` ya existe, conservá su contenido. Pegá tu URI de Atlas en `MONGODB_URI`
y reemplazá el marcador de contraseña localmente. Los caracteres especiales
del usuario y contraseña deben estar codificados para una URL.
`MONGODB_DB=rick_morty` selecciona la base del proyecto sin usar los datos de ejemplo.
MongoDB crea la base cuando se escribe el primer documento.

Configurá también `JWT_SECRET` con una clave aleatoria de al menos 32 caracteres.
Podés generarla localmente con `node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"`.
Nunca compartas esa clave. Los tokens vencen a las 24 horas.

No compartas `.env`, ni lo subas a Git. `.env.example` contiene solo marcadores.
Autorizá tu IP actual en Atlas. Para la aplicación, usá un usuario con permiso
`readWrite` limitado a `rick_morty`.

## Ejecutar

```powershell
npm run build
npm start
```

Para desarrollo: `npm run start:dev`.

Abrí `http://localhost:3000/api/health`. Si la conexión funciona, responde:

```json
{ "status": "ok", "database": "connected" }
```

Si no conecta, revisá la URI, las credenciales, la lista de IP de Atlas y que
el clúster esté disponible. No pegues credenciales en capturas o reportes.

Si Node devuelve `querySrv ECONNREFUSED` pero la consulta funciona con un DNS
público, agregá `DNS_SERVERS=1.1.1.1` a `.env`. Esto configura las consultas DNS
de Node antes de conectar a Atlas, sin modificar Windows. Dejá el valor vacío
para usar el DNS del sistema. No hace falta esta opción en otros entornos si
su resolución DNS funciona normalmente.

## Autenticación

| Método | Ruta | Datos |
| --- | --- | --- |
| POST | `/api/auth/register` | `{ "name": "Demo", "email": "demo@example.com", "password": "password123" }` |
| POST | `/api/auth/login` | `{ "email": "demo@example.com", "password": "password123" }` |
| GET | `/api/auth/profile` | Header `Authorization: Bearer TOKEN` |
| PUT | `/api/auth/profile` | `{ "name": "Nuevo nombre" }`, con el mismo header |

Para cambiar la contraseña, el PUT también requiere `currentPassword` y
`newPassword` (6 a 128 caracteres). Nunca envíes un ID de usuario: el servidor
identifica la cuenta a partir del JWT. Ambas contraseñas se omiten al editar solo
el nombre. Reiniciá el backend después de compilar los cambios.

El registro devuelve `{ user }` sin iniciar sesión. El login devuelve `{ user, token }`.
La contraseña se guarda como hash scrypt con salt aleatorio y no se devuelve.
El correo es único y se normaliza a minúsculas; las cuentas nuevas tienen rol `user`.
El índice único de MongoDB evita registros duplicados incluso con solicitudes simultáneas.

Ejecutá `npm test` para compilar y comprobar autenticación con persistencia simulada,
validación de formularios, hashing y tokens. Estas pruebas no escriben en Atlas.
Como mejora pendiente queda agregar limitación de intentos y solicitudes a la API.

## Fotos de usuarios y comentarios

El perfil acepta `profilePhoto` como JPEG en data URL (hasta 180000 caracteres),
o una cadena vacía para quitarlo. Angular acepta JPG/PNG/WebP de hasta 5 MB y
genera una miniatura JPEG de 256 × 256 antes de enviarla. Se guarda en el usuario,
no en el personaje. El límite JSON del backend es 256 KB.

Los siguientes endpoints requieren `Authorization: Bearer TOKEN`:

| Método | Ruta | Datos |
| --- | --- | --- |
| GET | `/api/characters/:id/comments?page=1` | Páginas de 20 comentarios |
| POST | `/api/characters/:id/comments` | `{ "text": "Comentario" }` |
| PATCH | `/api/comments/:id/visibility` | `{ "hidden": true }` o `false` |
| DELETE | `/api/comments/:id` | Borrado definitivo |

Solo el autor y los administradores pueden ocultar, restaurar o borrar. Los
comentarios ocultos se filtran en MongoDB: únicamente su autor y administradores
pueden consultarlos. La respuesta incluye `canManage`, calculado por el servidor.
El rol se consulta en la base de datos; modificar el almacenamiento del navegador
no concede permisos. Los comentarios no exponen correos ni hashes de sus autores.

Para promover una cuenta **ya existente**, ejecutá localmente desde `backend`:

```powershell
npm run admin:promote -- correo@ejemplo.com
```

El script actualiza solo esa cuenta. No existe un endpoint público para asignar
roles y todos los registros nuevos reciben el rol `user`.
