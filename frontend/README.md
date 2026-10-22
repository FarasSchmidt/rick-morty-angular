# Rick & Morty · Frontend

Interfaz Angular para explorar personajes y episodios, administrar el perfil y participar en los comentarios.

[Abrir la aplicación](https://rick-morty-angular-snowy.vercel.app/) · [Documentación del proyecto](../README.md)

## Desarrollo

```powershell
npm ci --include=dev
npm start
```

Disponible en `http://localhost:4200`, con el backend local en el puerto 3000.

## Comandos

| Comando | Función |
| --- | --- |
| `npm start` | Inicia el servidor de desarrollo |
| `npm run build` | Genera el build de producción |
| `npm test` | Ejecuta las pruebas con Karma y Chrome |

El build de producción utiliza `src/app/config/auth-api.config.production.ts` y se genera en `dist/rick-morty-angular/browser`. Vercel publica esa carpeta y redirige las rutas a `index.html`.
