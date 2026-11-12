<h1 align="center">Trazo</h1>

<p align="center">
  <strong>Gestión inteligente de proyectos</strong><br />
  Cada proyecto tiene un camino.
</p>

<p align="center">
  <em>Project Management &amp; Intelligence · demo con datos simulados</em>
</p>

<p align="center">
  <a href="https://github.com/Dxexo10/trazo/actions/workflows/ci.yml">
    <img src="https://github.com/Dxexo10/trazo/actions/workflows/ci.yml/badge.svg" alt="Estado del CI" />
  </a>
</p>

<p align="center">
  <a href="https://trazo-nine.vercel.app"><strong>Demo online</strong></a> ·
  <a href="docs/DEMO_GUIDE.md">Guía de demo</a> ·
  <a href="docs/ARCHITECTURE.md">Arquitectura</a>
</p>

<p align="center">
  <img src="docs/screenshots/dashboard.png" alt="Dashboard ejecutivo de Trazo" width="100%" />
</p>

Trazo centraliza el portafolio de proyectos de una empresa —presupuestos, avance, fechas, responsables y estado— y convierte cada cambio relevante en información trazable. No es un CRUD: cada edición genera una **versión inmutable** y un **evento por campo auditado**, y la interfaz explica **qué cambió, cuándo, quién lo hizo y qué regla disparó la alerta**. Dinero en céntimos enteros, fechas ISO-8601 UTC y un dataset determinista.

Incluye reglas de control de desviación presupuestal: advertencia por encima del 10 % y crítica por encima del 20 %.

## Aviso sobre la demo

La demo online ejecuta **el frontend en modo mock**: datos simulados y deterministas guardados en IndexedDB, sin login ni backend. El backend **Express + Prisma + SQL Server** está incluido en el repositorio y se ejecuta en local; no está desplegado. Las instrucciones están en [Cómo ejecutarlo localmente](#cómo-ejecutarlo-localmente).

## Capturas

| Portafolio | Historial de versiones |
| --- | --- |
| ![Portafolio con filtros](docs/screenshots/projects.png) | ![Historial de versiones](docs/screenshots/project-history.png) |
| Búsqueda, filtros combinables, orden, paginación y archivado lógico. | Cada versión conserva autor, fecha, motivo, cambios y reglas disparadas. |

| Comparador antes/después | Centro de alertas |
| --- | --- |
| ![Comparador de versiones](docs/screenshots/version-comparison.png) | ![Centro de alertas](docs/screenshots/alerts.png) |
| Diff de campos auditables entre dos instantáneas del proyecto. | Alertas con severidad, estado y la regla que las originó. |

| Monitor de cambios | Actividad |
| --- | --- |
| ![Monitor de cambios](docs/screenshots/monitor.png) | ![Timeline de actividad](docs/screenshots/activity.png) |
| Feed agrupado por fecha con filtros por proyecto, campo, origen y periodo. | Auditoría de acciones con filtros por usuario, acción, origen y periodo. |

## Funcionalidades principales

- **Dashboard ejecutivo:** KPIs calculados desde el mismo estado, tendencia mensual, distribución por estado, presupuesto inicial vs. actual y proyectos que requieren atención. El periodo vive en la URL.
- **Portafolio:** búsqueda, filtros de estado, prioridad, sector, responsable y riesgo, orden, paginación y archivado lógico (sin borrado físico).
- **Alta y edición transaccional:** una sola operación actualiza el proyecto, crea la versión, registra los cambios y evalúa las reglas.
- **Historial y comparador:** versiones inmutables, diff antes/después y explicación de la regla que originó cada alerta.
- **Motor de reglas y alertas:** siete reglas configurables (presupuesto, fechas, vencimiento, bloqueo y prioridad), con estados abierta/revisada/resuelta y auditoría.
- **Monitor y actividad:** feed de cambios y timeline de auditoría, ambos con filtros reflejados en la URL.
- **Reportes:** resumen ejecutivo, vista previa y exportación real a CSV y XLSX con los filtros activos; el PDF se obtiene con la impresión del navegador.
- **Escenarios demo y capa de datos intercambiable:** cuatro escenarios simulados y adaptadores mock/HTTP detrás de los mismos contratos. Interfaz responsive, navegación por teclado y auditoría axe AA.

## Arquitectura

```text
UI (features + components)
  → hooks de datos (TanStack Query)
  → contratos de repositorio (src/data/contracts)
      ├── mock + IndexedDB     sin VITE_API_BASE_URL
      └── HTTP + fetch         con VITE_API_BASE_URL
              → Express 5 · /api/v1 (helmet, CORS, Zod, request-id)
                  → dominio puro (diff, reglas, métricas, dashboard)
                      → Prisma 6
                          → SQL Server
```

`src/data/index.ts` es el **único punto de composición**: decide entre los adaptadores mock y HTTP según el entorno. Las vistas, los hooks y el dominio no cambian al conectar la API. Detalle completo en [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Decisiones técnicas

- **Dinero en céntimos enteros** (ADR-004): sin errores de coma flotante; se persiste como `INT` y se formatea con `Intl.NumberFormat('es-PE')`.
- **Dataset determinista con reloj fijo** (ADR-005): semilla `20261031` y fecha de referencia `2026-10-31`; la demo no envejece y las pruebas son reproducibles.
- **Reportes sin librerías de hojas de cálculo** (ADR-011): `ReportDocument` puro, CSV con RFC 4180, XLSX OOXML comprimido con `fflate` y PDF vía impresión del navegador.
- **SQL Server con Prisma** (ADR-012 y ADR-013): UUID, `datetime2` UTC, enums como `nvarchar`, JSON en `nvarchar(max)` y relaciones `NoAction`.
- **Navegación honesta** (ADR-008 y ADR-010): cada enlace apunta a una ruta real; no hay pantallas simuladas ni botones decorativos.

Contexto y consecuencias en [docs/DECISIONS.md](docs/DECISIONS.md).

## Stack tecnológico

- **Frontend:** React 19, Vite 8, TypeScript 6, Tailwind CSS 4, shadcn/ui sobre Base UI, TanStack Query 5, React Hook Form + Zod 4, Recharts, Lucide, `idb`, `fflate`.
- **Backend:** Node.js ≥ 20.19, Express 5, TypeScript 6, Zod 4, Prisma 6.
- **Datos:** SQL Server 2022 Express en local; IndexedDB para el modo mock.
- **Calidad:** Vitest 5, React Testing Library, Playwright 1.64 + axe, ESLint 10, Prettier 3.
- **CI:** GitHub Actions con lint, typecheck, formato, cobertura, build y E2E.

## Calidad y pruebas

Resultados de la última verificación local:

- **199 pruebas unitarias** en el frontend, **82,34 % de líneas** cubiertas.
- **64 pruebas** en el backend, **95,34 % de líneas** cubiertas (dominio, esquemas, rutas y middleware).
- **14 flujos E2E** con Playwright sobre el entorno mock: flujo estrella, reset, simulador, móvil y auditoría axe AA.
- **1 E2E de integración** contra la API y SQL Server reales; requiere backend y base de datos, por eso no se ejecuta en CI.
- Umbrales de cobertura y `format:check` obligatorios en CI.

```bash
# Frontend
cd frontend
npm run lint
npm run typecheck
npm run format:check
npm run test:coverage
npm run build
```

```bash
# Backend
cd backend
npm run lint
npm run typecheck
npm run format:check
npm run test:coverage
npm run build
```

```bash
# E2E
cd frontend
npx playwright install chromium   # primera vez
npm run test:e2e                  # modo mock
npm run test:e2e:api              # requiere backend y SQL Server en marcha
```

El E2E de integración necesita el backend arrancado con `DEMO_WRITES_ENABLED=true`; por eso no se ejecuta en CI.

## Cómo ejecutarlo localmente

Requisito: Node.js ≥ 20.19.

### (a) Modo mock, solo frontend

No requiere backend ni base de datos.

```bash
cd frontend
npm ci --include=dev
npm run dev        # http://localhost:5173
```

La primera carga siembra IndexedDB. Sin `VITE_API_BASE_URL`, la aplicación usa los repositorios mock.

### (b) Modo completo con API y SQL Server

1. Crear `backend/.env` a partir de `backend/.env.example` y definir:
   - `DATABASE_URL` con la cadena de SQL Server.
   - `CORS_ORIGINS=http://localhost:5173`.
2. Instalar, migrar y sembrar:

```bash
cd backend
npm ci --include=dev
npm run db:deploy
npm run db:seed
npm run dev        # http://localhost:4000/api/v1/health
```

`npm run db:seed` **recrea** el dataset demo; ejecútalo solo cuando quieras restaurarlo.

3. Crear `frontend/.env` a partir de `frontend/.env.example`:

```text
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

4. Arrancar el frontend:

```bash
cd frontend
npm ci --include=dev
npm run dev        # http://localhost:5173
```

Notas de entorno:

- Si tu shell define `NODE_ENV=production`, instala con `npm ci --include=dev` y define `DEMO_WRITES_ENABLED=true` en local; de lo contrario la API arranca en solo lectura y las escrituras responden `403 demo_read_only`.
- El frontend decide mock o API en tiempo de build: si cambias `VITE_API_BASE_URL`, reinicia el servidor de desarrollo.

## Alcance

**Incluye:** portafolio y dashboard, versionado inmutable con comparador, motor de reglas y alertas, monitor, actividad, reportes CSV/XLSX/PDF, configuración y reset demo, escenarios simulados, API REST con SQL Server y capa de datos mock/HTTP, accesibilidad auditada con axe y CI con umbrales de cobertura.

**No incluye:** autenticación ni roles reales, multiempresa, notificaciones por correo, scheduler o jobs persistentes, integraciones externas, importaciones, IA generativa, pagos, colaboración en tiempo real, app móvil nativa, observabilidad avanzada ni rate limiting.

**Siguiente paso previsto:** autenticación y roles.

**Estado actual:** frontend completo y demo pública en modo mock; backend y SQL Server verificados en local, con integración HTTP y escenarios en servidor. El perfil de usuario es fijo y de demostración.

## Estructura del repositorio

```text
Trazo/
├── frontend/        React + Vite; features, dominio, contratos y adaptadores
│   ├── src/data/    mock (IndexedDB) y HTTP detrás de los mismos contratos
│   ├── src/domain/  modelos, diff, reglas, métricas y agregaciones puras
│   └── e2e/         Playwright: flujo estrella, accesibilidad e integración API
├── backend/         Express + Zod + Prisma
│   ├── src/modules/ un router por recurso de la API
│   ├── src/domain/  schemas, servicios y seed determinista
│   └── prisma/      esquema y migración de SQL Server
├── docs/            arquitectura, ADRs, diseño, demo, estado y capturas
├── .github/         workflow de CI
├── PRODUCT.md
├── TRAZO_MASTER_SPEC.md
├── TRAZO_BRAND_GUIDELINES.md
└── LICENSE
```

## Documentación adicional

- [Arquitectura](docs/ARCHITECTURE.md)
- [Decisiones técnicas (ADR)](docs/DECISIONS.md)
- [Design system](docs/DESIGN_SYSTEM.md)
- [Estado de implementación](docs/IMPLEMENTATION_STATUS.md)
- [Guía de demo](docs/DEMO_GUIDE.md)
- [Especificación maestra](TRAZO_MASTER_SPEC.md)
- [Guía de marca](TRAZO_BRAND_GUIDELINES.md)
- [Producto](PRODUCT.md)

## Licencia

[MIT](LICENSE) · Proyecto personal de demostración. Los nombres de clientes, personas y montos son ficticios.
