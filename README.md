# Cinegold

Aplicación web para una sala de cine, con catálogo, cartelera, reservaciones y gestión administrativa. El proyecto incluye interfaz React, API Node.js/Express y persistencia con SQL Server.

## Tecnologías

- React, Vite y Tailwind CSS
- Node.js, Express y API REST
- SQL Server
- Autenticación JWT, validación de solicitudes y carga de imágenes

## Preparación.

1. Instala dependencias en `frontend` y `backend` con el gestor correspondiente a cada `package.json`.
2. Crea una base SQL Server y aplica un esquema propio. Los scripts SQL originales y los informes internos no forman parte de esta publicación.
3. Copia los archivos `.env.example` a `.env` y configura valores propios; genera un `JWT_SECRET` aleatorio y restringe los permisos de la cuenta de base de datos.
4. Inicia API y frontend en terminales separadas.

Este repositorio representa un proyecto académico. Revisa y configura seguridad, servicios de correo, pagos y base de datos antes de cualquier despliegue.
