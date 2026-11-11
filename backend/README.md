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

## Dominio y validación

`src/domain/models` contiene las entidades serializables de la API y
`src/domain/schemas` las validaciones Zod compartidas por los módulos:

- `createProjectSchema` / `updateProjectSchema`: ciudades, presupuestos en
  céntimos, fechas `YYYY-MM-DD`, reglas de completado y rechazo de campos
  desconocidos.
- `projectQuerySchema`, `alertQuerySchema` y `activityQuerySchema`: filtros
  repetidos o separados por coma, paginación acotada y fechas ISO.
- `src/lib/prisma.ts` expone un `PrismaClient` único, sin conectar al arrancar.

Los módulos de negocio, Prisma y SQL Server llegan en las siguientes tareas de
la Fase 5 y la Fase 6. La lista de endpoints planeados está en
[`src/modules/README.md`](src/modules/README.md).
