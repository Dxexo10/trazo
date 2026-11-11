<h1 align="center">Trazo</h1>

<p align="center">
  <strong>Gestión inteligente de proyectos</strong><br />
  Cada proyecto tiene un camino.
</p>

<p align="center">
  <em>Project Management &amp; Intelligence · demo funcional con datos simulados</em>
</p>

---

Trazo es una plataforma SaaS de gestión y monitoreo inteligente de proyectos
empresariales, orientada inicialmente al mercado peruano y latinoamericano.
Centraliza portafolio, presupuestos, avances y alertas, y conserva el historial
de cada cambio para explicar qué se modificó, cuándo y por qué.

La demo usa **datos ficticios deterministas** y un reloj de referencia fijo, de
modo que el portafolio siempre se ve coherente sin depender de un backend.

> Repositorio: [`Dxexo10/trazo`](https://github.com/Dxexo10/trazo). La URL
> anterior de GitHub redirige automáticamente al nuevo nombre.

[![CI](https://github.com/Dxexo10/trazo/actions/workflows/ci.yml/badge.svg)](https://github.com/Dxexo10/trazo/actions/workflows/ci.yml)

Guion de demo: [`docs/DEMO_GUIDE.md`](docs/DEMO_GUIDE.md).

## Índice

- [Identidad](#identidad) · [Estado del proyecto](#estado-del-proyecto) ·
  [Stack](#stack) · [Cómo ejecutar](#cómo-ejecutar) ·
  [Arquitectura](#arquitectura) · [Datos simulados](#datos-simulados) ·
  [Pruebas y calidad](#pruebas-y-calidad) · [Capturas](#capturas) ·
  [Limitaciones conocidas](#limitaciones-conocidas)

## Identidad

- **Paleta:** grafito `#252824`, terracota `#C65D3A`, marfil `#F5F2EB`,
  arena `#E7E0D5` y oliva `#60715A`.
- **Tipografía:** Manrope para encabezados e Inter para interfaz y cifras.
- **Layout:** Floating Workspace con sidebar de altura completa (248 px / 76 px),
  perfil y saludo dinámico arriba, submenús jerárquicos y pie anclado.
- **Apariencia:** tema claro, Trazo Nocturno y modo sistema con preferencia
  persistida y contraste AA en ambos temas.
- Guía completa: [`TRAZO_BRAND_GUIDELINES.md`](TRAZO_BRAND_GUIDELINES.md).

## Estado del proyecto

| Fase                                               | Alcance                                                                                                    | Estado         |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------- |
| **F1 · Fundamentos + Dashboard + identidad Trazo** | Design system, layout responsive, dataset simulado, repositorios mock sobre IndexedDB, dashboard ejecutivo | **Disponible** |
| **F2 · Proyectos**                                 | Portafolio con filtros en URL, alta/edición, archivado y detalle                                           | **Disponible** |
| **F3 · Inteligencia de cambios**                   | Versiones inmutables, comparador antes/después, motor de reglas, centro de alertas, monitor e historial    | **Disponible** |
| **F4 · Pulido y QA**                               | Actividad, ajustes y reset demo, E2E con Playwright, CI y capturas                                         | **Disponible** |
| **M06 · Reportes**                                 | Exportación CSV/XLSX del portafolio y de las alertas con filtros, resumen ejecutivo imprimible             | **Disponible** |
| **F5 · Backend**                                   | API REST con Node/Express, dominio, validación Zod, seed y módulos de negocio | **Disponible (local)** |
| **F6 · SQL Server**                                | Esquema Prisma, migración inicial, seed determinista y transacciones              | **Disponible (local)** |
| F7 · Integración                                   | Adaptador HTTP en el frontend, autenticación si procede y despliegue              | Planificado    |

### Disponible hoy

- Dashboard ejecutivo (`/dashboard`) con saludo personalizado, KPIs calculados
  desde los datos, tres gráficos, tabla de proyectos que requieren atención y
  actividad reciente en formato timeline.
- Filtro de periodo (3 / 6 / 12 meses) reflejado en la URL: ajusta la serie
  mensual y la comparación contra el periodo anterior, mientras los totales
  siempre representan el portafolio activo completo.
- Navegación flotante de altura completa con perfil demo, saludo por hora local,
  submenús con rutas reales (incluye Archivados e Historial de versiones),
  modo expandido/compacto, tooltips y preferencia persistida.
- Selector de apariencia Claro / Oscuro / Sistema con tema propio «Trazo
  Nocturno», script anti-flash y reacción a `prefers-color-scheme`.
- Layout responsive completo: compacta desde tablet, drawer móvil con foco,
  Escape y scroll bloqueado; topbar flotante independiente.
- Portafolio `/projects` con búsqueda, filtros combinables de estado, prioridad,
  sector, responsable y riesgo, orden, paginación y modo de archivados
  (ocultar, incluir o solo archivados).
- Vista de tabla en desktop y tarjetas en móvil, con acciones de ver, editar y
  archivar (con confirmación y archivado lógico).
- Vista `Archivados` (`/projects?archivados=solo`) con encabezado propio y un
  estado vacío que explica cómo archivar proyectos.
- Formulario crear/editar con React Hook Form + Zod: información general,
  línea base vs. presupuesto actual, cronograma, avance y reglas de completado.
- Edición transaccional: cada cambio relevante crea una versión inmutable, un
  evento por campo modificado y las alertas que dispare el motor de reglas.
- Detalle `/projects/:id` con KPIs, alcance, presupuesto, alertas relacionadas,
  actividad reciente y pestañas de historial y comparación antes/después.
- Historial de versiones con autor, fecha, origen, motivo y campos cambiados;
  comparador entre dos versiones con las reglas que se dispararon.
- Monitor `/monitor` con feed agrupado por fecha, filtros por proyecto, campo,
  origen, severidad y periodo, detalle del cambio y enlaces al proyecto.
- Centro de alertas `/alerts` con contadores, filtros, la regla que originó cada
  alerta y acciones para revisar o resolver con trazabilidad.
- Actividad `/activity`: timeline de auditoría con filtros por proyecto, usuario,
  acción, origen y periodo, más paginación.
- Configuración `/settings`: perfil demo, umbrales de reglas editables, versión
  del dataset y reset con confirmación.
- Reportes `/reports`: resumen ejecutivo y detalle del portafolio o de las
  alertas con los filtros activos, exportación real a CSV y XLSX (con corte,
  fecha de generación y rótulo de datos simulados) e impresión del resumen para
  guardarlo como PDF.
- Dataset determinista de 50 proyectos, versiones, cambios, alertas, actividad y
  reglas persistidos en IndexedDB (sobreviven a la recarga).
- Suite E2E con Playwright del flujo estrella y workflow de CI con lint,
  typecheck, pruebas, build y E2E.
- **API REST local** (`backend/`) con dashboard, proyectos, versiones, cambios,
  alertas, actividad, reglas y usuarios sobre SQL Server, con seed determinista,
  edición transaccional y reset demo. El frontend todavía consume IndexedDB; la
  conexión HTTP llega en la Fase 7.
- Estados de carga, error y vacío; navegación por teclado y foco visible.

## Stack

- **React 19 + Vite + TypeScript** (modo estricto)
- **Tailwind CSS v4** con tokens de diseño propios
- **shadcn/ui** sobre Base UI + **Lucide React**
- **Manrope + Inter** autohospedadas con `@fontsource-variable`
- **React Router 7**, **TanStack Query 5**, **Recharts**
- **React Hook Form + Zod** (base de formularios de la Fase 2)
- **idb** para persistencia local
- **fflate** para generar archivos XLSX (ZIP + OOXML) sin librerías de hojas de cálculo
- **Vitest + React Testing Library** · **Playwright** (E2E + axe) · **ESLint + Prettier**
- **Node.js + Express 5 + TypeScript + Zod** (backend en `backend/`)
- **Prisma 6** con la migración inicial aplicada en SQL Server 2022 Express
  (base `Trazo`); `DATABASE_URL` vive en `backend/.env`, ignorado por git.

## Cómo ejecutar

Requisitos: Node.js ≥ 20.19 y npm ≥ 10.

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

Backend (esqueleto de la Fase 5):

```bash
cd backend
npm install
npm run dev        # http://localhost:4000/api/v1/health
```

La base requiere `backend/.env` con `DATABASE_URL` (ignorado por git). Para
aplicar migraciones y sembrar el demo:

```bash
npm run db:deploy
npm run db:seed
```

Scripts disponibles:

```bash
npm run dev            # servidor de desarrollo
npm run build          # compilación de producción
npm run preview        # sirve el build
npm run typecheck      # TypeScript sin emitir
npm run lint           # ESLint
npm run lint:fix       # ESLint con correcciones
npm run format         # Prettier
npm run format:check   # Verificar formato sin escribir
npm run test           # Vitest
npm run test:coverage  # Vitest con cobertura
npm run test:e2e       # Playwright (flujo estrella, móvil y axe)
npm run test:e2e:ui    # Playwright en modo interactivo
```

> Si tu entorno define `NODE_ENV=production`, instala con
> `npm install --include=dev` para incluir las dependencias de desarrollo, y
> ejecuta las pruebas con `NODE_ENV=test npm run test`.

## Arquitectura

```text
UI (features + components)
        ↓
Hooks / casos de uso (TanStack Query)
        ↓
Contratos de repositorio (src/data/contracts)
        ↓
Adaptador mock + IndexedDB  ← Fase 1
        ↓
Adaptador HTTP + API REST   ← Fase 5 (misma interfaz)
```

La UI nunca importa fixtures directamente. Para conectar el backend real solo se
sustituyen las instancias exportadas en `src/data/index.ts`; vistas y servicios
de dominio no cambian. Detalle completo en
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Datos simulados

- Semilla fija `20261031`, generador propio (mulberry32) y fecha de referencia
  `2026-10-31`, documentados en [`docs/DECISIONS.md`](docs/DECISIONS.md).
- 50 proyectos de tecnología, construcción y consultoría, 10 responsables
  ficticios, alertas y actividad derivadas del mismo estado.
- Persistencia local en la base IndexedDB `trazo-demo`; la resiembra se fuerza
  con `seedVersion`.
- Dinero como enteros en céntimos; fechas en ISO-8601 UTC.
- La etiqueta **“Entorno de demostración · Datos simulados”** es visible en toda
  la aplicación.

## Pruebas y calidad

```bash
npm run lint && npm run typecheck && NODE_ENV=test npm run test && npm run build
```

El backend se verifica por separado:

```bash
cd backend && npm run lint && npm run typecheck && npm test && npm run build
```

Cobertura actual: utilidades de dinero y fechas, agregación de KPIs, determinismo
del dataset, repositorios sobre IndexedDB, diff de versiones, motor de reglas y
alertas, feed de cambios, dashboard, filtros de portafolio, validación del
formulario, historial/comparador, monitor, alertas, actividad, configuración,
navegación y reportes (documentos, CSV y XLSX). La suite E2E cubre el flujo
estrella, el reset, el simulador, la navegación móvil y una auditoría axe AA en
las pantallas principales. El backend prueba los esquemas Zod del dominio y el
esqueleto de la API (salud, errores, `x-request-id` y 404).

## Capturas

Capturas reales de la aplicación en ejecución con el dataset ficticio del demo.

| Dashboard                                              | Proyectos                                                |
| ------------------------------------------------------ | -------------------------------------------------------- |
| ![Dashboard ejecutivo](docs/screenshots/dashboard.png) | ![Portafolio con filtros](docs/screenshots/projects.png) |

| Historial de versiones                                          | Comparador antes/después                                            |
| --------------------------------------------------------------- | ------------------------------------------------------------------- |
| ![Historial de versiones](docs/screenshots/project-history.png) | ![Comparador de versiones](docs/screenshots/version-comparison.png) |

| Monitor de cambios                                  | Detalle de un cambio                                       |
| --------------------------------------------------- | ---------------------------------------------------------- |
| ![Monitor de cambios](docs/screenshots/monitor.png) | ![Detalle del cambio](docs/screenshots/monitor-detail.png) |

| Centro de alertas                                 | Actividad                                               |
| ------------------------------------------------- | ------------------------------------------------------- |
| ![Centro de alertas](docs/screenshots/alerts.png) | ![Timeline de actividad](docs/screenshots/activity.png) |

| Configuración                                        | Móvil                                                        |
| ---------------------------------------------------- | ------------------------------------------------------------ |
| ![Configuración demo](docs/screenshots/settings.png) | ![Portafolio en móvil](docs/screenshots/projects-mobile.png) |

## Limitaciones conocidas

- El frontend todavía consume el dataset de IndexedDB; la API ya sirve los
  mismos datos desde SQL Server, pero el adaptador HTTP llega en la Fase 7.
- La API no tiene autenticación y el reset demo no está protegido: es un
  entorno local de demostración, no una exposición pública.
- No hay multiempresa real: el perfil es fijo y de demo.
- La accesibilidad AA se audita automáticamente con axe en las pantallas
  principales; falta validación manual con lectores de pantalla.
- Los escenarios se ejecutan en el navegador, no con jobs reales.
- Las capturas de escritorio se tomaron en 1440 px (el dashboard, en 1280 px);
  la interfaz también se verificó en 768 y 390 px.
- El periodo del dashboard afecta a la tendencia y a los deltas frente al
  periodo anterior; los totales y la distribución representan el portafolio
  activo completo.
- No hay demo pública desplegada todavía: para probarla hay que ejecutarla en
  local. No se publica un enlace `Live Demo` hasta que exista.
- El PDF de reportes se obtiene con la impresión del navegador («Guardar como
  PDF»), no con un generador embebido; el CSV/XLSX sí se descargan como archivo.

## Licencia

[MIT](LICENSE) · Proyecto personal de demostración. Los nombres de clientes,
personas y montos son ficticios.
