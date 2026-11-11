# Arquitectura — Trazo (frontend-first)

## Objetivo

Construir el frontend completo con datos simulados de modo que la sustitución
por una API REST real no obligue a reescribir vistas, hooks ni reglas de negocio.

## Capas

```text
src/features/**          Pantallas, componentes de dominio y hooks de datos
src/components/**        UI reutilizable (ui/ shadcn, shared/, charts/)
src/domain/**            Modelos, reglas puras y servicios de agregación
src/data/**              Contratos de repositorio + implementación mock
src/lib/**               Configuración de la demo, etiquetas y utilidades de UI
src/app/**               Router, providers, layout y puntos de entrada
```

Flujo de una consulta:

```text
DashboardPage
  └─ useDashboardSummary(periodo)          (TanStack Query)
      └─ projectRepository.getAll()         (contrato)
      └─ alertRepository.getAll()           (contrato)
      └─ activityRepository.list()          (contrato)
          └─ Mock*Repository + IndexedDB    (adaptador Fase 1)
      └─ buildDashboardSummary(...)         (función pura, testeable)
```

## Contratos

Definidos en `src/data/contracts`:

- `ProjectRepository`: `list`, `getAll`, `getById`, `create`, `update`, `archive`,
  `listVersions`. `update` aplica el estado, crea la versión y devuelve
  `ProjectUpdateResult` con cambios y alertas generadas.
- `VersionRepository`: `getAll`, `getById`, `listByProject`, `list`.
- `ChangeEventRepository`: `getAll`, `listByProject`, `listByVersion`, `list`.
- `RuleConfigRepository`: `list`, `update`.
- `AlertRepository`: `list`, `getAll`, `getById`, `updateStatus`, `countOpen`.
- `ActivityRepository`: `list`, `getAll`.

`src/data/index.ts` es el **único punto de composición**. En la Fase 5 basta con
implementar `HttpProjectRepository`, `HttpAlertRepository` y
`HttpActivityRepository` contra `/api/v1` y cambiar esas tres líneas.

La Fase 5–7 se construye sobre **SQL Server** (`Trazo` en `localhost,1433`) con
Prisma y el conector `sqlserver`, según ADR-012. El frontend no cambia: solo se
sustituyen los adaptadores mock por los HTTP.

## Dominio

- `domain/models`: entidades serializables (dinero en céntimos, fechas ISO).
- `domain/services/project-metrics`: vencimiento, variación presupuestal y
  puntuación de riesgo explicable.
- `domain/services/project-diff`: compara los campos auditables y produce los
  eventos de cambio.
- `domain/services/change-rules`: evalúa presupuesto, fecha, vencimiento,
  bloqueo y prioridad contra `RuleConfig`; una sola alerta de presupuesto por
  transición.
- `domain/services/change-feed`: une cambios, versiones, proyectos, actores y
  alertas para monitor; filtros y paginación puros.
- `domain/services/dashboard-summary`: agrega KPIs, series y distribuciones a
  partir de proyectos y alertas. Sin acceso a red, 100 % testeable.
- `features/reports/report-data`: transforma proyectos o alertas en un
  `ReportDocument` (columnas tipadas, filas, métricas y metadatos de corte,
  generación, filtros y rótulo demo). Es una función pura, sin acceso a red.
- `features/reports/export`: CSV nativo con BOM UTF-8 y escapado RFC 4180, y
  XLSX como paquete OOXML mínimo comprimido con `fflate`; las columnas de dinero,
  porcentaje y avance conservan celdas numéricas reales.
- `domain/utils`: formato de moneda (`Intl.NumberFormat('es-PE')`), fechas y
  utilidades de identificadores.

## Persistencia

`data/mock/storage/db.ts` abre IndexedDB (`trazo-demo`, versión 2) con los
stores `projects`, `versions`, `changes`, `alerts`, `activity`, `rules` y
`meta`. En el primer acceso, o cuando cambia `seedVersion` / `schemaVersion` /
`referenceDate`, se vuelve a sembrar el dataset determinista. La versión de
semilla actual es 3.

La edición de un proyecto es un único caso de uso transaccional
(`data/mock/services/apply-project-update.ts`): actualiza el proyecto, guarda la
versión inmutable, escribe un `ChangeEvent` por campo, evalúa las reglas,
deduplica alertas por `(projectId, versionId, ruleId)` y registra la actividad.
El dataset inicial recorre el mismo diff/motor para que versiones, cambios y
alertas sean coherentes desde el primer render.

Los adaptadores simulan latencia de 120–320 ms **solo en desarrollo**; en tests y
producción no hay esperas artificiales.

## Backend (Fase 5, en curso)

El directorio `backend/` contiene el esqueleto de la API, no todavía los módulos
de negocio:

```text
src/config/env.ts        Validación de entorno con Zod (PORT, CORS_ORIGINS, NODE_ENV)
src/app.ts               Ensamblado de Express (helmet, CORS, JSON, request-id, logging)
src/server.ts            Arranque HTTP y cierre ordenado ante SIGINT/SIGTERM
src/middleware/**        request-id, request-logger, notFound y errorHandler
src/routes/**            Router versionado /api/v1 y salud
src/domain/models/**     Entidades serializables de la API
src/domain/schemas/**    Validaciones Zod compartidas por los módulos
src/domain/services/**   Diff, reglas, métricas, dashboard y seed determinista
src/domain/seed/**       Generadores del dataset demo con UUID deterministas
src/data/repositories/** Implementaciones Prisma de cada contrato
src/lib/prisma.ts        Cliente Prisma único (conexión diferida)
prisma/schema.prisma     Modelo relacional para SQL Server
src/modules/**           dashboard, projects, alerts, activity, versions,
                         changes, rules, users y demo (implementados)
```

- Respuesta de salud: `GET /api/v1/health` → `{ status, service, uptimeSeconds, timestamp }`.
- Errores uniformes: `{ error: { code, message, details?, requestId } }`; los
  detalles solo se exponen fuera de producción.
- CORS restringido por `CORS_ORIGINS`, cuerpo JSON limitado a 1 MB y cabecera
  `x-request-id` reflejada en cada respuesta.
- `src/domain/models` replica las entidades serializables del frontend y
  `src/domain/schemas` concentra las validaciones Zod (proyecto, consultas de
  proyectos, alertas y actividad) que usarán los módulos.
- `prisma/schema.prisma` define el modelo relacional para SQL Server, ya
  validado: enums como `nvarchar`, JSON serializado en `nvarchar(max)` y
  relaciones `NoAction` para evitar cascadas múltiples.
- La migración inicial ya está aplicada en SQL Server 2022 Express (base
  `Trazo`). `DATABASE_URL` vive solo en `backend/.env` (ignorado por git), la
  cuenta `trazo_mcp` es `db_owner` únicamente de `Trazo` y
  `prisma/migrations` conserva el historial.
- `npm run db:seed` recrea el dataset demo determinista (semilla `20261031`,
  fecha de referencia `2026-10-31`) con 50 proyectos, versiones, cambios,
  alertas, actividad y reglas.
- Los módulos implementados cubren dashboard, proyectos (alta, edición
  transaccional, archivado, historial y cambios), alertas, actividad, versiones,
  cambios, reglas, usuarios y el reset demo. Las escrituras usan el perfil demo
  fijo hasta que exista autenticación.

## Apariencia y navegación

- `lib/theme.ts` concentra el tipo `ThemePreference`, la clave
  `trazo:theme`, la lectura segura de `localStorage`, la resolución
  `light | dark | system` y la aplicación de `.dark` / `color-scheme`.
- `app/theme-provider.tsx` aplica el tema, escucha
  `matchMedia('(prefers-color-scheme: dark)')` en modo sistema y sincroniza
  pestañas con el evento `storage`. `app/theme-context.ts` expone `useTheme`.
- `index.html` incluye un script inline mínimo que aplica el tema antes del
  primer render para evitar el flash de tema incorrecto.
- `app/layouts/nav-items.ts` define módulos, submenús y el estado activo más
  específico según `pathname` + query params. `sidebar.tsx`,
  `sidebar-submenu.tsx`, `sidebar-profile.tsx` y `appearance-control.tsx`
  componen la navegación; el drawer móvil reutiliza el mismo contenido.
- `lib/greeting.ts` + `hooks/use-greeting.ts` concentran la franja horaria local,
  reprograman la actualización en los límites 05:00, 12:00 y 19:00 y eligen el
  saludo del dashboard con una semilla de `sessionStorage`
  (`trazo:greeting-seed`) para que sea estable durante la sesión.
- Preferencias locales: `trazo:nav-collapsed` (expansión) y `trazo:theme`
  (apariencia). Ambas son cosméticas: si `localStorage` falla, la UI sigue
  funcionando en memoria.

## Renderizado

- Rutas con carga diferida (`React.lazy` + `Suspense`).
- Gráficos cargados aparte del dashboard para no bloquear el primer render.
- Chunks de vendor separados (React, UI, charts, query).
- Providers: `ThemeProvider`, TanStack Query, Tooltip y Toaster (sonner).

## Reglas de negocio implementadas en Fase 3

- Presupuesto: alerta desde cero, advertencia > 10 % y crítica > 20 % respecto a
  la versión anterior; exactamente 20 % se queda en advertencia.
- Fecha de entrega postergada, proyecto vencido, estado bloqueado y prioridad
  crítica.
- Sin cambios en los campos auditables no hay versión ni alerta.
- Idempotencia por `(projectId, versionId, ruleId)`.

## Reglas de negocio implementadas en Fase 1

- KPIs siempre calculados desde el mismo estado que la tabla y la actividad.
- Variación presupuestal `(actual − inicial) / inicial`; si la base es 0 no se
  calcula porcentaje y se muestra un caso explícito.
- Riesgo de proyecto: vencimiento (+40), bloqueo (+30), prioridad crítica (+15),
  sobrecosto >20 % (+15) o >10 % (+8), avance <30 % en ejecución (+10).
- Periodo del dashboard = ventana de meses sobre `createdAt` para la tendencia
  mensual y los deltas contra la ventana anterior. Los totales, la distribución
  y las alertas representan el portafolio activo completo.

## Reportes

- `/reports` comparte el estado de filtros en la URL: `vista`, `q`, `estado`,
  `prioridad`, `sector`, `responsable`, `riesgo` y `archivados` para portafolio;
  `a_estado`, `a_severidad`, `a_proyecto` y `a_periodo` para alertas. Cambiar de
  pestaña conserva el filtro de la otra, y cada pestaña limpia solo el suyo.
- La consulta pide hasta `REPORT_MAX_ROWS = 500` filas al repositorio (el dataset
  demo tiene 50 proyectos) y aplica el filtro de riesgo en memoria con la misma
  función del dashboard.
- El mismo `ReportDocument` alimenta el resumen ejecutivo, la vista previa y la
  exportación; no se recalculan cifras por separado.
- Los metadatos del archivo incluyen fecha de corte, fecha de generación,
  filtros activos y la etiqueta `Entorno de demostración · Datos simulados`.
- El PDF se obtiene con `window.print()` y utilidades `print:hidden` en sidebar,
  topbar, pie, pestañas, filtros y botones; no se simula un generador embebido.

## Pruebas

- **Unitarias/integración:** Vitest + jsdom + `fake-indexeddb` sobre dominio,
  repositorios, seed y pantallas.
- **E2E:** Playwright con Chromium, servidor Vite propio en el puerto 4173 y
  reset del dataset antes de cada escenario (`e2e/star-flow.spec.ts`).
- **CI:** `.github/workflows/ci.yml` ejecuta lint, typecheck, pruebas, build y
  E2E; publica el reporte de Playwright como artefacto.

## Verificación

```bash
npm run lint
npm run typecheck
NODE_ENV=test npm run test
npx playwright install chromium   # primera vez
npm run test:e2e
npm run build
```
