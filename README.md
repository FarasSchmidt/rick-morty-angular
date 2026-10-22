# Rick & Morty

Aplicación web para explorar personajes de Rick & Morty, consultar sus episodios y compartir comentarios. Incluye cuentas de usuario, perfiles con foto y moderación de comentarios por roles.

[Abrir la aplicación](https://rick-morty-angular-snowy.vercel.app/) · [Estado de la API](https://rick-morty-api-rzmt.onrender.com/api/health)

## Funcionalidades

- Registro e inicio de sesión, con persistencia al recargar la página dentro de la misma pestaña.
- Búsqueda de personajes por nombre y catálogo paginado de 20 tarjetas por página.
- Detalle con imagen, estado, especie, género, origen, ubicación y episodios. La lista de episodios permite ver más o volver a mostrar menos.
- Perfil editable con nombre, foto y cambio de contraseña. El registro y el cambio de contraseña incluyen confirmación e indicador de fortaleza.
- Comentarios por personaje, con opciones para ocultar, volver a mostrar y borrar.
- Moderación de comentarios de otros usuarios desde una cuenta administradora.
- Interfaz responsive con tema oscuro y navegación protegida por sesión.

Cada usuario puede administrar sus propios comentarios. Los administradores también pueden moderar los ajenos. Los comentarios ocultos solo son visibles para su autor y los administradores; estos permisos se comprueban en el backend. Las cuentas nuevas siempre tienen el rol de usuario.

## Tecnologías

| Parte | Tecnologías |
| --- | --- |
| Frontend | Angular 20, TypeScript, Angular Material, Bootstrap Grid y SCSS |
| Backend | NestJS 11, JWT, Mongoose y class-validator |
| Base de datos | MongoDB Atlas |
| Despliegue | Vercel y Render |
| Catálogo | [The Rick and Morty API](https://rickandmortyapi.com/) |

Los personajes y episodios se consultan en The Rick and Morty API. Las cuentas, fotos y comentarios se guardan en MongoDB mediante una API propia. Las contraseñas se almacenan como hashes scrypt con salt aleatorio y los tokens de acceso vencen a las 24 horas.

## Instalación local

Entorno utilizado: **Node.js 24.18.0 y npm 11.16.0**. Se necesita una base MongoDB y un usuario con permisos de lectura y escritura sobre ella.

```powershell
git clone https://github.com/FarasSchmidt/rick-morty-angular.git
cd rick-morty-angular
```

### Backend

```powershell
cd backend
npm ci --include=dev
Copy-Item .env.example .env
```

Si ya existe `.env`, conservá su contenido. Completá las siguientes variables:

| Variable | Valor o uso |
| --- | --- |
| `MONGODB_URI` | Cadena de conexión de MongoDB |
| `MONGODB_DB` | Nombre de la base; por defecto, `rick_morty` |
| `JWT_SECRET` | Clave privada aleatoria de al menos 32 caracteres |
| `FRONTEND_ORIGIN` | `http://localhost:4200` para desarrollo |
| `PORT` | Puerto del backend; por defecto, `3000` |
| `DNS_SERVERS` | Opcional: resolutores DNS separados por comas; vacío usa los del sistema |

Para generar una clave:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

En Atlas, autorizá la IP desde la que se ejecutará el backend. El archivo `.env` está excluido de Git.

```powershell
npm run build
npm start
```

El estado de la conexión se consulta en `http://localhost:3000/api/health`. Para desarrollo con recarga automática: `npm run start:dev`.

### Frontend

En otra terminal, desde la raíz del repositorio:

```powershell
cd frontend
npm ci --include=dev
npm start
```

Abrí `http://localhost:4200`. El servidor de desarrollo utiliza el backend local; la compilación de producción utiliza la API de Render mediante el reemplazo de configuración definido en `angular.json`.

## Pruebas y compilación

Desde `backend`, `npm test` compila y ejecuta las pruebas de autenticación, validación, contraseñas, perfiles y permisos de comentarios con persistencia simulada, sin escribir en Atlas.

Desde `frontend`, `npm test` ejecuta las pruebas con Karma y requiere Chrome disponible. `npm run build` genera la versión de producción en `frontend/dist/rick-morty-angular/browser`.

## Administración

Para asignar el rol de administrador a una cuenta existente, ejecutá desde `backend` con la conexión de esa base configurada:

```powershell
npm run admin:promote -- correo@ejemplo.com
```

La asignación se realiza mediante un script local. No hay una ruta pública para modificar roles.

## Despliegue

El frontend se publica en Vercel desde `frontend`. El archivo `vercel.json` define la compilación y la redirección de las rutas de Angular. El backend se publica en Render desde `backend`, con sus variables de entorno configuradas en el servicio.

Para otro entorno, actualizá la URL de `frontend/src/app/config/auth-api.config.production.ts` y configurá `FRONTEND_ORIGIN` en el backend con el origen del frontend, sin barra final. Atlas debe permitir las IP de salida del servicio que ejecuta la API.

La documentación de los endpoints se encuentra en [backend/README.md](backend/README.md).

## Sobre el proyecto

El proyecto comenzó como una práctica de consumo de una API REST y se amplió con un backend propio, persistencia en MongoDB, fotos de perfil y comentarios con moderación. La autenticación utiliza esta API propia en lugar del servicio externo indicado en la consigna original.

Como mejora pendiente queda incorporar límites de intentos y solicitudes a la API.

Desarrollado por [Faras Schmidt](https://github.com/FarasSchmidt).
