# Admin Zebra

Panel administrativo construido con Next.js 15, Tailwind CSS y componentes reutilizables para gestionar usuarios administradores y empresas (tenants).

## Requisitos

- Node.js 18 o superior
- npm (o pnpm/yarn, según prefieras)
- Base de datos PostgreSQL accesible desde el entorno de ejecución

## Configuración local

1. Copia el archivo de variables de entorno y completa los valores reales:

   ```bash
   cp .env.example .env.local
   ```

   | Variable            | Descripción                                      |
   | ------------------- | ------------------------------------------------ |
   | `POSTGRES_HOST`     | Host o IP de tu servidor PostgreSQL              |
   | `POSTGRES_PORT`     | Puerto del servidor (por defecto `5432`)        |
   | `POSTGRES_DB`       | Nombre de la base de datos (`zebra_col`, etc.)   |
   | `POSTGRES_USER`     | Usuario con permisos sobre el esquema `admin_platform` |
   | `POSTGRES_PASSWORD` | Contraseña del usuario                           |
   | `POSTGRES_SSL`      | `true` si el proveedor requiere conexión SSL     |

2. Ajusta `lib/config.ts` si deseas cambiar los valores por defecto; el proyecto trae credenciales de ejemplo para entornos donde no se puedan definir variables (no recomendado en producción).

3. Instala dependencias:

   ```bash
   npm install
   ```

4. Levanta el entorno de desarrollo:

   ```bash
   npm run dev
   ```

5. Abre `http://localhost:3000` y accede con un usuario existente en la tabla `admin_platform.admin_users`.

## Scripts disponibles

- `npm run dev`: ejecuta el servidor de desarrollo.
- `npm run build`: genera el build de producción (requiere variables de entorno configuradas).
- `npm run start`: levanta la app en modo producción tras un build exitoso.
- `npm run lint`: placeholder para ESLint (instala `eslint` si deseas utilizarlo).

## Esquema de base de datos

El proyecto espera el esquema `admin_platform` con las tablas:

- `admin_platform.admin_users`
- `admin_platform.tenants`

Consulta el archivo `docs/schema.sql` (o las DDL proporcionadas) para crear las tablas si aún no existen.

## Multitenencia

- Ejecuta el script `docs/multitenant_functions.sql` en tu base de datos para registrar las funciones `admin_platform.crear_tenant`, `admin_platform.actualizar_tenant` y `admin_platform.eliminar_tenant` que se encargan de clonar el esquema `tenant_base`.
- La API de creación de tenants ahora invoca `admin_platform.crear_tenant`, que además de generar el nuevo registro en `admin_platform.tenants` duplica el esquema base y crea un usuario administrador con contraseña *hash* dentro del esquema recién provisionado.
- Asegúrate de que exista el esquema plantilla `tenant_base` con la estructura enviada (tablas, secuencias, triggers y la función `set_updated_at`).
- La contraseña enviada desde el formulario se cifra con bcrypt en la aplicación antes de invocar la función almacenada; el hash resultante se reutiliza para el usuario administrador del tenant.
- Las vistas de administración permiten crear, editar (incluida la rotación opcional de contraseña) y eliminar tenants consumiendo las funciones anteriores (`PUT`/`DELETE` via `/api/tenants/:id`).

## Despliegue en Railway

1. Crea un repositorio en GitHub y sube el proyecto (`.env.local` está ignorado por Git, usa `.env.example`).
2. En Railway, crea un nuevo proyecto desde tu repositorio GitHub.
3. Configura las variables de entorno en Railway (`POSTGRES_*`). Puedes usar un servicio de base de datos gestionado o apuntar a tu instancia externa.
4. Ajusta los comandos de despliegue si es necesario (por defecto Railway detecta Next.js y ejecuta `npm run build` seguido de `npm run start`).
5. Desactiva la caché estática si usas otro proveedor; aquí se fuerza renderizado dinámico (`dynamic = "force-dynamic"`).

## Buenas prácticas

- No compartas archivos `.env.local`; usa `.env.example` con valores vacíos o ficticios.
- Ejecuta `npm run build` antes de subir cambios para asegurarte de que el proyecto compila con las variables configuradas.
- Considera añadir pruebas y linting según tus necesidades.

---

¡Listo! El proyecto está preparado para ser versionado y desplegado en Railway a través de GitHub.
