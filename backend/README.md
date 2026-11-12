# Trazo API (Fase 5)

Backend Node.js + Express + TypeScript del proyecto Trazo. Este directorio
contiene por ahora el **esqueleto**: configuración validada con Zod, aplicación
Express modular, middlewares transversales, versionado de la API y pruebas.

## Requisitos

- Node.js ≥ 20.19
- npm ≥ 10

## Cómo ejecutar

```bash
cd backend
npm install
cp .env.example .env   # opcional en desarrollo
npm run dev            # http://localhost:4000/api/v1/health
```

Scripts disponibles:

```bash
npm run dev            # servidor con recarga (tsx watch)
npm run build          # compila a dist/
npm start              # ejecuta el build
npm run typecheck      # TypeScript sin emitir
npm run lint           # ESLint
npm run lint:fix       # ESLint con correcciones
npm run format         # Prettier
npm run format:check   # verifica formato sin escribir
npm run test           # Vitest
npm run test:watch     # Vitest en modo interactivo
npm run db:format      # formatea prisma/schema.prisma
npm run db:validate    # valida el esquema (requiere DATABASE_URL)
npm run db:generate    # genera @prisma/client
npm run db:migrate     # crea/aplica migraciones en desarrollo
npm run db:deploy      # aplica migraciones pendientes (sin shadow database)
npm run db:studio      # Prisma Studio
```

## Modelo de datos

`prisma/schema.prisma` define las entidades del producto para SQL Server:
`User`, `Project`, `ProjectVersion`, `ChangeEvent`, `Alert`, `ActivityLog`,
`RuleConfig` y `DemoScenario`.

Restricciones del conector `sqlserver` que el esquema ya respeta:

- Sin enums nativos: los estados se guardan como `nvarchar` y Zod los valida.
- Sin tipo `Json`: `tags`, `snapshot`, `metadata` y `changes` se guardan como
  JSON serializado en `nvarchar(max)`.
- Sin cascadas: SQL Server rechaza rutas de cascada múltiples; las relaciones
  usan `NoAction` y el producto no elimina proyectos.
- Dinero en céntimos (`Int`), identificadores `UNIQUEIDENTIFIER` y fechas
  `datetime2` en UTC.

La migración inicial (`prisma/migrations/20261111030000_init`) ya está aplicada
sobre SQL Server 2022 Express (`localhost,1433`, base `Trazo`). La cadena
`DATABASE_URL` vive en `backend/.env`, **ignorado por git**, y el login
`trazo_mcp` es `db_owner` únicamente de `Trazo`.

- `npm run db:deploy` aplica migraciones pendientes sin shadow database.
- `npm run db:migrate` requiere permisos para crear la shadow database; si el
  login no los tiene, genera el SQL con `prisma migrate diff` y usa `db:deploy`.
- `prisma/migrations/migration_lock.toml` usa `provider = "mssql"`, el nombre
  interno que Prisma exige para el conector `sqlserver`.

**Nunca subas `.env` ni contraseñas al repositorio.**

### Despliegue y modo solo lectura

`CORS_ORIGINS` acepta una lista separada por comas. En producción las escrituras
se desactivan por defecto: `POST`/`PATCH` de proyectos, alertas y reglas, el
reset demo y los escenarios responden `403 demo_read_only`. Para habilitarlas
explícitamente define `DEMO_WRITES_ENABLED=true`; no lo hagas en una demo
pública. Con el valor por defecto, el despliegue queda de solo lectura y el
frontend muestra el mensaje del backend en el toast.

## Dominio y validación

`src/domain/models` contiene las entidades serializables de la API y
`src/domain/schemas` las validaciones Zod compartidas por los módulos:

- `createProjectSchema` / `updateProjectSchema`: textos, presupuestos en
  céntimos, fechas `YYYY-MM-DD`, reglas de completado y rechazo de campos
  desconocidos.
- `projectQuerySchema`, `alertQuerySchema`, `activityQuerySchema`,
  `changeQuerySchema` y `versionQuerySchema`: filtros repetidos o separados por
  coma, paginación acotada y fechas ISO.
- `src/lib/prisma.ts` expone un `PrismaClient` único, sin conectar al arrancar.

## Seed

`npm run db:seed` recrea el dataset determinista del demo (semilla `20261031`,
fecha de referencia `2026-10-31`): 10 usuarios, 50 proyectos, 133 versiones,
248 cambios, 49 alertas, 288 eventos de actividad y 7 reglas. Los
identificadores se generan como UUID deterministas para respetar
`UNIQUEIDENTIFIER`.

El seed **borra y vuelve a crear** las tablas del demo; no lo ejecutes sobre
datos reales.

## API implementada

| Método | Ruta                                        | Descripción                                          |
| ------ | ------------------------------------------- | ---------------------------------------------------- |
| GET    | `/api/v1/health`                            | Estado del servicio                                  |
| GET    | `/api/v1/dashboard/summary?periodMonths=12` | KPIs, tendencia, distribución y atención             |
| GET    | `/api/v1/projects`                          | Portafolio con filtros, orden y paginación           |
| POST   | `/api/v1/projects`                          | Alta con versión 1 y auditoría                       |
| GET    | `/api/v1/projects/:id`                      | Detalle                                              |
| PATCH  | `/api/v1/projects/:id?reason=`              | Edición transaccional: versión, cambios, alertas     |
| POST   | `/api/v1/projects/:id/archive`              | Archivado lógico                                     |
| GET    | `/api/v1/projects/:id/versions`             | Historial de versiones                               |
| GET    | `/api/v1/projects/:id/changes`              | Cambios auditados del proyecto                       |
| GET    | `/api/v1/alerts`                            | Alertas con filtros y paginación                     |
| GET    | `/api/v1/alerts/count-open`                 | Alertas abiertas del portafolio activo               |
| GET    | `/api/v1/alerts/:id`                        | Detalle de alerta                                    |
| PATCH  | `/api/v1/alerts/:id/status`                 | Revisar o resolver con auditoría                     |
| GET    | `/api/v1/activity`                          | Timeline de actividad                                |
| GET    | `/api/v1/versions`                          | Versiones globales                                   |
| GET    | `/api/v1/versions/:id`                      | Detalle de versión                                   |
| GET    | `/api/v1/changes`                           | Cambios globales con filtros                         |
| GET    | `/api/v1/rules`                             | Configuración de reglas                              |
| PATCH  | `/api/v1/rules/:id`                         | Umbral, severidad o habilitación                     |
| GET    | `/api/v1/users`                             | Responsables del demo                                |
| POST   | `/api/v1/demo/reset`                        | Restaura el dataset inicial                          |
| POST   | `/api/v1/demo/scenarios/:id/run`            | Aplica un escenario demo y registra versión simulada |

Las escrituras usan el perfil demo fijo (`DEMO_CURRENT_USER`) porque todavía no
hay autenticación. El endpoint de reset está pensado solo para el entorno de
demostración; no expongas esta API públicamente sin protegerla.
