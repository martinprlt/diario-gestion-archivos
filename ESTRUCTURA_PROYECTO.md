# Estructura del Proyecto

Este documento detalla la estructura del proyecto, incluyendo el frontend y el backend, la función de cada archivo y cómo se interrelacionan.

## Descripción General del Sistema

El proyecto es un **Sistema de Gestión de Contenidos (CMS)** diseñado para un flujo de trabajo editorial. Permite a diferentes roles de usuario (como Periodistas, Fotógrafos, Editores y Administradores) colaborar en la creación, revisión y publicación de artículos.

Las funcionalidades clave incluyen:
-   **Gestión de Roles y Permisos**: Asignación de diferentes capacidades a cada tipo de usuario.
-   **Flujo de Artículos**: Los periodistas pueden subir artículos, los editores pueden revisarlos, aprobarlos o solicitar cambios.
-   **Gestión Multimedia**: Los fotógrafos pueden subir y gestionar imágenes.
-   **Comunicación Interna**: Un sistema de chat en tiempo real para facilitar la colaboración entre los usuarios.
-   **Panel de Administración**: Herramientas para gestionar usuarios, roles y categorías.

## Backend

El backend está construido con Node.js y Express. Se encarga de la lógica de negocio, la gestión de la base de datos y la comunicación con el frontend a través de una API REST.

### Estructura de Carpetas del Backend

-   **`src/`**: Contiene todo el código fuente del backend.
    -   **`chat/`**: Módulo de chat en tiempo real.
        -   `chat.controller.js`: Orquesta los eventos y la lógica del chat.
        -   `chat.server.js`: Configura e inicializa el servidor de Socket.io para el chat.
    -   **`config/`**: Archivos de configuración.
        -   `db.js`: Configuración de la conexión a la base de datos (MongoDB con Mongoose).
        -   `multer.js` y `multer-fotos.js`: Configuraciones de Multer para la subida de archivos y fotos.
        -   `nodemailer.js`: Configuración para el envío de correos electrónicos.
    -   **`controllers/`**: Controladores que manejan la lógica de las peticiones HTTP.
        -   `auth.controller.js`: Lógica para autenticación, registro y gestión de sesiones.
        -   `user.controller.js`: Operaciones CRUD para los usuarios.
        -   `file.controllers.js`: Lógica para la gestión de archivos subidos.
        -   `article.controller.js`: Lógica relacionada con los artículos.
        -   ... y otros controladores para cada recurso (categorías, roles, etc.).
    -   **`middlewares/`**: Funciones que se ejecutan antes de llegar a las rutas.
        -   `auth.middleware.js`: Verifica la autenticación del usuario (tokens JWT).
        -   `error.middleware.js`: Manejo centralizado de errores.
        -   `trackActivity.js`: Rastrea la actividad del usuario.
    -   **`models/`**: Modelos de datos de la base de datos (esquemas de Mongoose).
        -   `user.model.js`: Esquema para los usuarios.
        -   `article.model.js`: Esquema para los artículos.
        -   `message.model.js`: Esquema para los mensajes del chat.
    -   **`routes/`**: Definición de las rutas de la API.
        -   `auth.routes.js`: Rutas para la autenticación.
        -   `user.routes.js`: Rutas para las operaciones de usuarios.
        -   `article.routes.js`: Rutas para los artículos.
        -   ... y así sucesivamente para cada recurso.
    -   **`service/`**: Servicios para lógica de negocio desacoplada.
        -   `mail.service.js`: Servicio para el envío de correos.
    -   **`uploads/`**: Carpeta donde se almacenan los archivos subidos por los usuarios (artículos, avatares, etc.).
    -   **`utils/`**: Funciones de utilidad.
        -   `logger.js`: Utilidad para registrar logs.
-   **`app.js`**: Archivo principal de la aplicación Express. Aquí se configuran los middlewares globales y las rutas.
-   **`server.js`**: Inicia el servidor HTTP y el servidor de Socket.io, poniéndolos a la escucha en un puerto específico.
-   **`.env.example`**: Archivo de ejemplo para las variables de entorno.
-   **`package.json`**: Define los metadatos del proyecto y las dependencias de Node.js.

## Frontend

El frontend está desarrollado con React y Vite. Es una Single Page Application (SPA) que consume la API del backend para mostrar y gestionar los datos.

### Estructura de Carpetas del Frontend

-   **`public/`**: Contiene los archivos estáticos que no se procesan por el build de Vite, como imágenes o favicons.
-   **`src/`**: Contiene todo el código fuente del frontend.
    -   **`assets/`**: Archivos como imágenes, estilos CSS, etc.
        -   `imagenes/`: Almacena las imágenes utilizadas en la aplicación.
        -   `styles/`: Hojas de estilo CSS para los diferentes componentes y páginas.
    -   **`components/`**: Componentes de React reutilizables en varias partes de la aplicación (ej. `Navbar`, `LoginForm`, `ChatBox`).
    -   **`context/`**: Contextos de React para el manejo del estado global.
        -   `AuthContext.js` y `AuthProvider.jsx`: Gestionan el estado de autenticación del usuario en toda la aplicación.
        -   `ChatContext.jsx`: Maneja el estado y la lógica del chat.
        -   `CategoriasContext.jsx`: Provee el estado de las categorías.
    -   **`hooks/`**: Hooks personalizados de React.
        -   `useHeartbeat.js`: Hook para mantener la sesión del usuario activa.
    -   **`pages/`**: Componentes que representan las páginas completas de la aplicación (ej. `Login`, `DashboardAdmin`, `ArticulosEnRevision`).
    -   **`routes/`**: Configuración de las rutas de la aplicación.
        -   `ProtectedRoutes.jsx`: Componente de orden superior para proteger rutas que requieren autenticación.
-   **`App.jsx`**: Componente raíz de la aplicación donde se definen las rutas principales y se anidan los demás componentes.
-   **`main.jsx`**: Punto de entrada de la aplicación. Aquí se renderiza el componente `App` en el DOM.
-   **`index.html`**: Plantilla HTML principal de la aplicación.
-   **`vite.config.js`**: Archivo de configuración para Vite, donde se pueden definir proxies, plugins, etc.
-   **`package.json`**: Define los metatos y dependencias del proyecto frontend.

## Relaciones y Flujo de Trabajo

### Relaciones Internas (Backend)

1.  **Petición HTTP**: Un cliente (el frontend) realiza una petición a una URL específica.
2.  **`app.js`**: La petición llega primero a `app.js`, que utiliza los middlewares definidos (como `cors`, `express.json()`).
3.  **Rutas (`routes/`)**: La petición se dirige al archivo de rutas correspondiente según la URL. Por ejemplo, una petición a `/api/users` es manejada por `user.routes.js`.
4.  **Middlewares (`middlewares/`)**: Antes de llegar al controlador, la petición puede pasar por middlewares específicos de la ruta, como `auth.middleware.js` para verificar si el usuario está autenticado.
5.  **Controladores (`controllers/`)**: Si la petición pasa los middlewares, llega al controlador. El controlador procesa la petición, interactúa con los modelos y servicios, y prepara una respuesta.
6.  **Modelos (`models/`)**: El controlador utiliza los modelos para interactuar con la base de datos (crear, leer, actualizar, eliminar datos).
7.  **Respuesta**: El controlador envía una respuesta al cliente, generalmente en formato JSON.

### Relaciones Internas (Frontend)

1.  **`main.jsx`**: Es el punto de partida. Renderiza el componente `App`.
2.  **`App.jsx`**: Contiene el enrutador principal (`React Router`). Define qué componente de página se debe mostrar para cada URL.
3.  **Contextos (`context/`)**: `App.jsx` está envuelto por los proveedores de contexto (`AuthProvider`, `ChatProvider`, etc.) para que cualquier componente hijo pueda acceder al estado global.
4.  **Páginas (`pages/`)**: Cuando un usuario navega a una URL, el enrutador renderiza el componente de página correspondiente.
5.  **Componentes (`components/`)**: Las páginas están compuestas por componentes más pequeños y reutilizables. Por ejemplo, la página `DashboardAdmin` puede usar el componente `Navbar` y `UsuarioTabla`.
6.  **Interacción con la API**: Los componentes y páginas realizan llamadas a la API del backend (usando `fetch` o `axios`) para obtener o enviar datos. El estado recibido se almacena localmente (usando `useState`, `useEffect`) o globalmente (usando `useContext`).

### Comunicación Frontend-Backend

-   **API REST**: La comunicación principal se realiza a través de una API REST. El frontend envía peticiones HTTP (GET, POST, PUT, DELETE) a los endpoints definidos en el backend. El backend responde con datos en formato JSON.
-   **WebSockets (Socket.io)**: Para funcionalidades en tiempo real como el chat, se utiliza Socket.io. El frontend establece una conexión persistente con el servidor de Socket.io en el backend. Esto permite una comunicación bidireccional instantánea para enviar y recibir mensajes sin necesidad de recargar la página.
-   **Autenticación**: El frontend envía las credenciales del usuario al backend. Si son válidas, el backend genera un JSON Web Token (JWT) y lo envía de vuelta. El frontend almacena este token (generalmente en `localStorage` o `sessionStorage`) y lo incluye en las cabeceras de las peticiones posteriores para autenticarse.

### Flujo de Trabajo General del Sistema (Ejemplo: Inicio de Sesión)

1.  **Usuario**: Abre la aplicación en el navegador y ve la página de `Login`.
2.  **Frontend (`Login.jsx`)**: El usuario introduce su email y contraseña en el formulario. Al enviarlo, se llama a una función que realiza una petición `POST` a `/api/auth/login` en el backend, enviando las credenciales.
3.  **Backend (`auth.routes.js` -> `auth.controller.js`)**:
    -   La ruta `/api/auth/login` recibe la petición.
    -   El `auth.controller` valida las credenciales contra la base de datos usando el `user.model`.
    -   Si las credenciales son correctas, genera un JWT.
    -   Responde al frontend con un JSON que contiene el token y los datos del usuario.
4.  **Frontend (`AuthContext.js`)**:
    -   Recibe la respuesta del backend.
    -   Almacena el token JWT en el almacenamiento local.
    -   Actualiza el estado de autenticación en el `AuthContext`, guardando los datos del usuario.
    -   Redirige al usuario a la página principal o al dashboard.
5.  **Navegación Protegida**: Ahora, si el usuario intenta acceder a una ruta protegida (ej. `/dashboard`), el componente `ProtectedRoutes.jsx` verifica si hay un token válido en el `AuthContext`. Si existe, permite el acceso; de lo contrario, lo redirige a la página de login.
6.  **Peticiones Autenticadas**: Para cualquier petición posterior a la API (ej. obtener la lista de usuarios), el frontend adjunta el token JWT en la cabecera `Authorization`. El middleware `auth.middleware.js` en el backend intercepta la petición, verifica la validez del token y, si es correcto, permite que la petición continúe hacia el controlador correspondiente.

## Datos Adicionales y Puntos Clave

-   **Variables de Entorno**: La configuración sensible (como credenciales de base de datos, secretos de JWT, claves de API) se gestiona a través de variables de entorno. En el backend, hay un archivo `.env.example` que sirve como plantilla. Para el desarrollo, se debe crear un archivo `.env` con los valores correspondientes.
-   **Manejo de Errores**: El backend cuenta con un middleware de manejo de errores (`error.middleware.js`) que centraliza la captura de errores asíncronos y síncronos, asegurando que el servidor no se caiga por excepciones no controladas y enviando respuestas de error consistentes al cliente.
-   **Gestión de Estado en Frontend**: El estado global de la aplicación (como la información del usuario autenticado, el estado del chat, etc.) se maneja principalmente con la **Context API** de React. Esto evita el "prop drilling" y permite que los componentes accedan a datos globales de manera eficiente.
-   **Scripts del Proyecto**: Tanto el `frontend` como el `backend` tienen sus propios `package.json` con scripts para facilitar el desarrollo:
    -   `npm run dev` (en ambas carpetas): Inicia el servidor de desarrollo (Vite para el frontend, Nodemon para el backend) que se recarga automáticamente al detectar cambios.
    -   `npm start` (en backend): Inicia el servidor en modo producción.
    -   `npm run build` (en frontend): Genera la versión de producción optimizada de la aplicación React.
-   **Subida de Archivos**: La subida de archivos (artículos, imágenes) se gestiona en el backend con la librería **Multer**. Los archivos se almacenan en la carpeta `src/uploads/` y las rutas a estos archivos se guardan en la base de datos.
