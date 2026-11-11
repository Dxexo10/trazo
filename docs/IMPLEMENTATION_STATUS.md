# Estado de implementación

Actualizado tras completar el **seed y los módulos de negocio del backend**,
corregir la **accesibilidad de las tablas con scroll**
(`scrollable-region-focusable`) y estabilizar las pruebas de Vitest; antes, el
esqueleto de la Fase 5, **M06 · Reportes** y el **cierre del Frente 1**.

## F5 · Esqueleto del backend — completado

| Tarea | Resultado |
| --- | --- |
| Workspace `backend/` | Node.js + Express 5 + TypeScript (NodeNext), ESM, scripts de dev/build/start |
| Configuración | `src/config/env.ts` valida `NODE_ENV`, `PORT`, `CORS_ORIGINS` y `DATABASE_URL` (opcional hasta F6) con Zod |
| Aplicación | `helmet`, CORS por lista de orígenes, JSON limitado a 1 MB, `x-request-id` y logging de peticiones |
| Errores | `AppError`/`NotFoundError`, `notFound` y `errorHandler` con cuerpo uniforme y sin filtrar detalles en producción |
| Rutas | `GET /api/v1/health`; `/api/v1` versionado y sin endpoints de negocio ficticios |
| Robustez | Cierre ordenado ante `SIGINT`/`SIGTERM` con límite de 10 s |
| Pruebas | Vitest + Supertest: salud, propagación de `x-request-id`, 404 y JSON malformado |
| CI | Job `backend` con lint, typecheck, pruebas y build |
| Documentación | `backend/README.md`, `backend/src/modules/README.md`, arquitectura y README raíz |

### Verificación ejecutada

```text
npm run typecheck   → sin errores
npm run lint        → 0 errores
npm run test        → 1 archivo, 4 pruebas aprobadas
npm run build       → dist generado
npm run format:check → sin diferencias
node dist/server.js → GET /api/v1/health responde 200 con x-request-id
```

### Pendiente de F5

- Autenticación y protección de la API (hoy usa el perfil demo fijo).
- Adaptador HTTP del frontend en F7.

## F5 · Módulos de negocio y seed — completado

| Tarea | Resultado |
| --- | --- |
| Seed determinista | 10 usuarios, 50 proyectos, 133 versiones, 248 cambios, 49 alertas, 288 eventos de actividad y 7 reglas; UUID deterministas y `npm run db:seed` |
| Dominio portado | Fechas, dinero, diff de proyecto, motor de reglas, métricas de riesgo, dashboard y feed de cambios con las mismas reglas del frontend |
| Repositorios Prisma | Proyectos, versiones, cambios, alertas, actividad, reglas y usuarios con filtros, orden y paginación |
| Proyectos | Listado, detalle, alta con versión 1, edición transaccional (versión, cambios, alertas), archivado, historial y cambios |
| Alertas | Listado, detalle, contador de abiertas y cambio de estado con auditoría |
| Resto de módulos | Actividad, versiones, cambios, reglas, usuarios y resumen del dashboard |
| Demo | `POST /api/v1/demo/reset` restaura el dataset inicial |
| Pruebas | 34 pruebas nuevas de diff, reglas, dashboard y determinismo del seed; 56 en total |
| Documentación | README del backend, módulos y este estado |

### Verificación ejecutada

```text
npm run typecheck → sin errores
npm run lint      → 0 errores
npm test          → 7 archivos, 56 pruebas aprobadas
npm run build     → dist generado

Prueba manual con el servidor y SQL Server real:
GET  /api/v1/projects?pageSize=2        → 50 proyectos paginados
GET  /api/v1/dashboard/summary          → KPIs, tendencia y atención
PATCH /api/v1/projects/PRJ-001          → versión 5, 1 cambio y 2 alertas
POST /api/v1/projects                   → PRJ-051 con versión 1
POST /api/v1/projects/:id/archive       → archivedAt asignado
PATCH /api/v1/alerts/:id/status         → resolved con actividad
PATCH /api/v1/rules/:id                 → umbral y severidad actualizados
POST /api/v1/demo/reset                 → dataset restaurado
```

## F5 · Modelo Prisma y dominio — completado

| Tarea | Resultado |
| --- | --- |
| Esquema Prisma | `prisma/schema.prisma` con `User`, `Project`, `ProjectVersion`, `ChangeEvent`, `Alert`, `ActivityLog`, `RuleConfig` y `DemoScenario` para SQL Server |
| Restricciones del motor | Enums como `nvarchar`, JSON serializado en `nvarchar(max)`, relaciones `NoAction` y dinero/céntimos, UUID y `datetime2` |
| Cliente Prisma | `src/lib/prisma.ts` con instancia única y conexión diferida; `postinstall` genera el cliente |
| Dominio | `src/domain/models` replica las entidades serializables del frontend |
| Validaciones | `src/domain/schemas` con Zod: alta/edición de proyecto, consultas de proyectos, alertas y actividad, paginación, UUID y fechas |
| Pruebas | 18 pruebas nuevas de esquemas: valores por defecto, reglas de completado, filtros CSV, límites y campos desconocidos |
| CI | Validación del esquema Prisma con `DATABASE_URL` de placeholder |
| Documentación | README del backend, arquitectura, ADR-013 y este estado |

### Verificación ejecutada

```text
npm run typecheck    → sin errores
npm run lint         → 0 errores
npm run test         → 3 archivos, 22 pruebas aprobadas
npm run build        → dist generado
npx prisma validate  → esquema válido
npx prisma generate  → cliente generado (v6.19.3)
```

### Base de datos (adelanto de F6)

- El login `trazo_mcp` existía y estaba habilitado, pero su contraseña no
  coincidía con la cadena del MCP. Se sincronizó usando la cuenta de Windows
  (`sysadmin`) y se confirmó que ya era `db_owner` de `Trazo`.
- La migración inicial `20261111030000_init` se aplicó con
  `prisma migrate deploy` y creó las 8 tablas de dominio más
  `_prisma_migrations`.
- `backend/.env` contiene `DATABASE_URL` y está ignorado por git; no hay
  credenciales versionadas.

### Verificación ejecutada

```text
npx prisma migrate status → Database schema is up to date!
MCP test_connection      → SQL Server 2022 Express, base Trazo
MCP list_tables          → users, projects, project_versions, change_events,
                           alerts, activity_logs, rule_configs, demo_scenarios
```


## M06 · Reportes — completado

| Tarea | Resultado | Commit |
| --- | --- | --- |
| Documento de reporte | `ReportDocument` puro con columnas tipadas, filas, métricas y metadatos de corte, generación, filtros y rótulo demo para portafolio y alertas | `223b0e9` |
| Exportadores | CSV con BOM y escapado RFC 4180; XLSX OOXML comprimido con `fflate` y celdas numéricas reales para dinero, porcentaje y avance | `223b0e9` |
| Pantalla `/reports` | Pestañas Portafolio/Alertas, filtros en URL, resumen ejecutivo, vista previa, descarga CSV/XLSX e impresión a PDF | `fc47523` |
| Navegación y accesibilidad | Entrada «Reportes» en la navegación, título de ruta y `/reports` añadida a la auditoría axe | `fc47523` |
| Pruebas | Documentos, CSV/XLSX, filtros en URL, render de la página y cambio de pestaña | `223b0e9` / `fc47523` |
| Documentación | README, arquitectura y ADR-011 | este bloque |

### Verificación ejecutada

```text
npm run typecheck → sin errores
npm run lint      → 0 errores, 0 advertencias
npm run test      → 30 archivos, 185 pruebas aprobadas (sin NODE_ENV)
npm run build     → dist generado (reports-page 30,79 kB · gzip 11,66 kB)
npm run test:e2e  → 14 pruebas aprobadas (Chromium), incluida /reports y la
                    auditoría axe en 8 pantallas sin violaciones graves
```

`npm run format:check` no se ejecutó en esta sesión; se comprobó Prettier sobre
los ficheros tocados (`npx prettier --check`) sin diferencias.

### Pendiente de M06

- Validar a mano la impresión/«Guardar como PDF» y la apertura de los XLSX en
  Excel y LibreOffice.

## Accesibilidad de tablas y estabilización de Vitest — completado

| Tarea | Resultado | Commit |
| --- | --- | --- |
| Tablas desplazables accesibles | El contenedor de `components/ui/table.tsx` es enfocable (`tabIndex`) y acepta `label` para exponer `role="region"` con nombre accesible y anillo de foco con los tokens del proyecto | `d23fabd` |
| Uso en la app | Portafolio, «Proyectos que requieren atención» y comparador de versiones pasan `label`; se elimina el `overflow-x-auto` redundante del comparador | `d23fabd` |
| Reportes | La vista previa usa el primitivo `Table` —región enfocable y etiquetada— en lugar de un `div` con `<table>` manual | `2325f9b` |
| Vitest | `vite.config.ts` fija `NODE_ENV=test` y `testTimeout` de 10 s para que `npm test` funcione sin exportar la variable y sin timeouts intermitentes | `2325f9b` |
| Causa raíz del fallo E2E | `scrollable-region-focusable` (serious) marcaba el `div.overflow-x-auto` de `/reports` en los tres reintentos del CI | — |

### Verificación ejecutada

```text
npm run test:e2e   → 14 pruebas aprobadas (Chromium)
npm run test       → 30 archivos, 185 pruebas aprobadas (sin NODE_ENV)
npm run lint       → 0 errores
npm run typecheck  → sin errores
npm run build      → dist generado
npx prettier --check (ficheros tocados) → sin diferencias
```

## Cierre del Frente 1 — completado

| Tarea | Resultado | Commit |
| --- | --- | --- |
| Archivados reales | `nav-items.ts` enlaza `/projects?archivados=solo`; el filtro pasa a tres modos (`no`/`include`/`only`) con `onlyArchived` en el contrato y el repositorio mock | este bloque |
| Historial de versiones | El submenú apunta a `/activity?accion=version.created` en lugar de «Próximamente» | este bloque |
| Navegación honesta | `NavChild.href` es obligatorio; se elimina `ComingSoonItem` y el componente huérfano `shared/coming-soon.tsx` | este bloque |
| Vista de archivados | Encabezado propio y estado vacío contextual en `/projects?archivados=solo` | este bloque |
| Metadatos sociales | `og:image`, `og:title`, `twitter:card` y `public/og-cover.png` (captura real del dashboard) | este bloque |
| `.env.example` | Documenta que el frontend no requiere variables y reserva `VITE_API_BASE_URL` para la Fase 5 | este bloque |
| README y docs | Stack y scripts corregidos (Playwright y `test:e2e` ya no figuran como planificados); design system, ADR-008/010 y guía de marca alineados | este bloque |

### Verificación ejecutada

```text
npm run lint       → 0 errores, 0 advertencias
npm run typecheck  → sin errores
NODE_ENV=test npm run test → 28 archivos, 174 pruebas aprobadas
npm run test:e2e   → 13 pruebas aprobadas (Chromium), incluye el submenú Archivados
npm run build      → dist generado
```

La validación manual con lectores de pantalla y la revisión visual en navegador
real siguen pendientes en el equipo del propietario.

## Rediseño de sidebar y apariencia — completado

| Tarea | Resultado | Commit |
| --- | --- | --- |
| Tokens Trazo Nocturno | `.dark` semántico, `--chart-muted`, contraste AA por tema | `67ca8c7` |
| Proveedor de apariencia | `trazo:theme`, `prefers-color-scheme`, `storage` y script anti-flash | `210f0f9` |
| Sidebar de altura completa | 248/76 px, `calc(100dvh - 32px)`, perfil arriba y pie anclado | `cc01a24` |
| Saludo dinámico | Franjas 05/12/19, actualización automática y tooltip compacto | `513dccf` |
| Submenús jerárquicos | Rutas reales, «Próximamente» honesto y popover lateral | `5966776` |
| Selector de apariencia | Segmentado expandido y menú accesible compacto | `d18a369` |
| Responsive | Drawer reutilizado, áreas seguras y scroll contenido | `926d85c` |
| Pruebas | Sidebar, submenús, apariencia, saludo y regresión del portafolio | `fa9dd23` |
| Documentación | Design system, marca, arquitectura, ADR y estado | este commit |
| Saludos unificados | Franja única, 3 variantes estables de dashboard y pruebas de límites | este commit |

### Diagnóstico del «dashboard con 0 proyectos»

La causa fue el cálculo del KPI «Total de proyectos» sobre la ventana temporal
en lugar del portafolio activo completo. Ya quedó corregido en
`b5042ac fix(dashboard): report full portfolio regardless of selected period`.
La regresión se refuerza ahora en `dashboard-page.test.tsx`: con el dataset
sembrado, el KPI muestra `50` y se mantiene al cambiar a 3 meses. No se usan
números estáticos en la aplicación.

### Verificación ejecutada

```text
npm run lint       → 0 errores, 0 advertencias
npm run typecheck  → sin errores
NODE_ENV=test npm run test → 28 archivos, 171 pruebas aprobadas
npm run build      → dist generado
```

No se ejecutó `npm run test:e2e` en esta sesión. La validación visual y de
lectores de pantalla queda pendiente en el navegador del propietario.

## Rebranding Trazo — completado

| Tarea                                                | Resultado                                             | Commits   |
| ---------------------------------------------------- | ----------------------------------------------------- | --------- |
| Identidad, paleta y guía de marca                    | `TRAZO_BRAND_GUIDELINES.md`, `PRODUCT.md` actualizado | `d8f7d8c` |
| Tokens terracota + Manrope + favicon + metadatos     | Design system aplicado                                | `942baaf` |
| Colores genéricos reemplazados por tokens semánticos | Badges, estados, tablas                               | `2eb0c86` |
| Sidebar flotante y drawer con identidad Trazo        | Logo, wordmark y estado activo terracota              | `db4cd1f` |
| Topbar flotante independiente                        | Breadcrumb, indicador demo y alertas                  | `78e8c11` |
| Gráficos con la nueva paleta                         | Recharts actualizado                                  | `85f5278` |
| Dashboard editorial                                  | Saludo, KPI destacada, timeline y superficies         | `9ff2bc2` |
| Pruebas de contraste AA y marca                      | 8 archivos, 43 pruebas                                | `3b5a011` |
| Rail compacto desde tablet                           | Responsive desde 768 px                               | `154202c` |

## Fase 1 — completada

| Tarea                                                              | Resultado         | Verificación                            | Commit      |
| ------------------------------------------------------------------ | ----------------- | --------------------------------------- | ----------- |
| Workspace Vite + React + TypeScript, alias, ESLint/Prettier/Vitest | Listo             | `lint`, `typecheck`                     | `dc350b0`   |
| Tokens de diseño Trazo y primitivas shadcn/ui                      | Listo             | revisión visual                         | `dc350b0`   |
| Modelos de dominio, utilidades de dinero y fechas                  | Listo             | unit tests                              | `f16a5e2`   |
| Dataset determinista (50 proyectos, alertas, actividad)            | Listo             | unit tests de determinismo y coherencia | `f16a5e2`   |
| Contratos de repositorio + adaptadores mock con IndexedDB          | Listo             | tests contra `fake-indexeddb`           | `f16a5e2`   |
| App shell: sidebar, topbar, drawer móvil, breadcrumbs, 404         | Listo             | smoke test de rutas                     | `13de103`   |
| Dashboard: KPIs, 3 gráficos, tabla de atención, actividad          | Listo             | smoke test de render                    | `13de103`   |
| Filtro de periodo en URL y recálculo de indicadores                | Listo             | verificación manual                     | `13de103`   |
| Pruebas unitarias y de render                                      | 43 tests en verde | `npm run test`                          | `3b5a011`   |
| Documentación (README, arquitectura, design system, ADRs)          | Listo             | revisión                                | este commit |

### Verificación ejecutada

```text
npm run lint       → 0 errores, 0 advertencias
npm run typecheck  → sin errores
npm run test       → 11 archivos, 57 pruebas aprobadas
npm run build      → dist generado (chunks separados por vendor y ruta)
```

Tamaño del build (gzip): React 150 kB · UI 54 kB · charts 130 kB (diferido) ·
app 35 kB · dashboard 8 kB.

## Fase 2 — completada

| Tarea                                                           | Resultado                                                                                  | Commits   |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------- |
| Filtros de portafolio en URL, consultas y esquema de formulario | Búsqueda, estado, prioridad, sector, responsable, riesgo, archivados, orden y paginación   | `246f902` |
| Listado `/projects`                                             | Tabla desktop, tarjetas móviles, archivado con confirmación, estados de carga/vacío/error  | `f88bfc6` |
| Alta y edición                                                  | Formulario compartido con Zod, presupuesto, cronograma y protección de cambios sin guardar | `a4c03cb` |
| Detalle `/projects/:id`                                         | KPIs, alcance, presupuesto, alertas, actividad y pestañas de Fase 3                        | `47b7979` |
| Pruebas de Fase 2                                               | Filtros, validación, render del listado y detalle                                          | `a0196b0` |

## Fase 3 — completada

| Tarea                       | Resultado                                                                                                           | Commits     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------- |
| Dominio de cambios          | Diff de campos auditables, motor de reglas con umbrales, feed enriquecido y etiquetas                               | `ceabe23`   |
| Persistencia                | Stores de versiones, cambios y reglas; esquema 2 y semilla 3; actualización transaccional y seed derivado del motor | `1d24439`   |
| Detalle del proyecto        | Historial de versiones, comparador antes/después, motivo opcional y badges compartidos                              | `1759148`   |
| Monitor `/monitor`          | Feed agrupado por fecha, filtros en URL, detalle del cambio y paginación                                            | `9105c64`   |
| Centro de alertas `/alerts` | Contadores, filtros, regla de origen y acciones revisar/resolver con auditoría                                      | `04f280c`   |
| Documentación y navegación  | README, arquitectura, estado y badges de fase actualizados                                                          | este commit |

### Verificación ejecutada

```text
npm run lint       → 0 errores, 0 advertencias
npm run typecheck  → sin errores
NODE_ENV=test npm run test → 20 archivos, 106 pruebas aprobadas
npm run build      → dist generado
```

Flujo manual comprobado en navegador: editar el presupuesto de `PRJ-001`
de S/ 4,200,000 a S/ 5,040,000 (+20 %) crea la versión 5, registra el evento
de presupuesto, genera la alerta de advertencia y la de proyecto vencido,
y actualiza monitor, centro de alertas, actividad y badge del topbar.
También se revisaron monitor, alertas, historial y comparador en 1440, 768
y 390 px.

## Fase 4 — completada en lo funcional

| Tarea                     | Resultado                                                                                     | Commits     |
| ------------------------- | --------------------------------------------------------------------------------------------- | ----------- |
| Actividad `/activity`     | Timeline de auditoría con filtros por proyecto, usuario, acción, origen y periodo; paginación | este bloque |
| Configuración `/settings` | Perfil demo, dataset, umbrales y severidades de reglas editables                              | este bloque |
| Reset demo                | Confirmación desde `/settings`; invalida todas las queries y vuelve al dataset inicial        | este bloque |
| Simulador de escenarios   | Cuatro escenarios demo desde el monitor con versión y alertas reales                          | este bloque |
| E2E Playwright            | Flujo estrella, reset, simulador, navegación móvil y axe en 7 pantallas                       | este bloque |
| CI                        | Workflow de lint, typecheck, pruebas, build y E2E con reporte como artefacto                  | este bloque |
| Capturas y demo           | 11 imágenes en `docs/screenshots/`, README actualizado y `DEMO_GUIDE.md`                      | este bloque |

### Verificación ejecutada

```text
npm run lint       → 0 errores, 0 advertencias
npm run typecheck  → sin errores
NODE_ENV=test npm run test → 24 archivos, 118 pruebas aprobadas
npm run test:e2e   → 12 pruebas aprobadas (Chromium)
npm run build      → dist generado
```

La E2E arranca un servidor Vite en el puerto 4173 y cubre: flujo estrella
(editar → versión 5 → alerta → monitor → revisar), reset demo, simulador de
presupuesto, navegación/filtros móviles y auditoría axe sin violaciones graves
en dashboard, proyectos, historial, monitor, alertas, actividad, reportes y
configuración. También verifica que el primer Tab enfoca el enlace de salto.

## F7 · Integración — en curso

| Tarea | Resultado | Commit |
| --- | --- | --- |
| Configuración de entorno | `VITE_API_BASE_URL` selecciona adaptadores HTTP; sin ella se usan los mocks y en modo test siempre se usan los mocks | este bloque |
| Cliente HTTP | `data/http/client.ts`: query CSV, `204`, `ApiError` con el mensaje del backend, `apiGetAllPages` (páginas de 100) y `apiList` (agrega páginas cuando el contrato pide más de 100 filas) | este bloque |
| Adaptadores | Proyectos, alertas, actividad, versiones, cambios, reglas y usuarios implementan los contratos existentes | este bloque |
| Reset y usuarios | `resetDemoData()` usa `POST /demo/reset` con API; nuevo `UserRepository` con adaptadores mock y HTTP (`GET /users`) | este bloque |
| Usuarios de la API | `useUsers()` alimenta filtros, formularios, chips y autores reales; se eliminan las lecturas de `DEMO_USERS` en las vistas | este bloque |
| Escenarios en servidor | `POST /demo/scenarios/:id/run` valida el escenario y `{ projectId }`, aplica el cambio con origen `simulated` y devuelve el `ProjectUpdateResult` | este bloque |
| Pruebas | 11 pruebas del cliente y adaptadores: serialización, errores, 404→null y paginación | este bloque |

### Verificación ejecutada

```text
npm run test      → 32 archivos, 196 pruebas aprobadas
npm run lint      → 0 errores
npm run typecheck → sin errores
npm run build     → dist generado
npm run test:e2e  → 14 pruebas aprobadas (modo mock)
backend npm test  → 62 pruebas aprobadas
```

Contra la API real con SQL Server local se comprobaron `/health`, `/projects`
(26 filtrados y 50 con archivados), `/versions` (133), `/changes` (248),
`/alerts` (49), `/alerts/count-open` (34), `/users` (10), `/rules` (7),
`/dashboard/summary` y un `PATCH` sin cambios (`changed: false`), con los mismos
shapes que consumen los adaptadores.

Smoke en Chromium con `VITE_API_BASE_URL` y la API/SQL Server reales: `/projects`
muestra 50 proyectos y 10 filas sin ningún «Sin asignar», el select de
responsable ofrece los 10 usuarios de `/users`, el dashboard refleja 50 y la
actividad resuelve autores del servidor, con 0 errores de consola.

El endpoint de escenarios se probó contra la API real: `budget-increase` sobre un
proyecto devolvió `changed: true`, versión nueva con `source: "simulated"` y su
motivo, 1 cambio y 2 alertas (+15 % de presupuesto); un escenario desconocido
responde 400 y un proyecto inexistente 404. Después se ejecutó `/demo/reset` y se
recuperó el dataset inicial (50 proyectos, 133 versiones).

### Pendiente de F7

- Conectar el simulador del frontend (`use-simulate-update`) a
  `POST /demo/scenarios/:id/run` para que en modo HTTP lo ejecute el servidor.
- Autenticación/roles si procede y despliegue.

## Pendiente inmediato

- Validación manual con lectores de pantalla y navegador real más allá de axe.
- Portada social y metadata del repositorio en GitHub.
- Validar a mano la impresión a PDF y la apertura de los XLSX en Excel/LibreOffice.

## Pendiente posterior

- **Fase 7:** conectar el simulador del frontend al endpoint de escenarios,
  autenticación/protección de la API y despliegue.

## Bloqueos conocidos

- Ninguno funcional. La instalación en local requiere `npm install --include=dev`
  porque el entorno define `NODE_ENV=production`; las pruebas ya no dependen de
  exportar `NODE_ENV=test` porque Vitest lo fija en `vite.config.ts`.
- El cambio a esquema 2 / semilla 3 fuerza una resiembra del dataset demo y
  descarta ediciones locales previas (comportamiento esperado del entorno mock).
- La instalación de Google Chrome para Playwright requiere privilegios de
  administrador; se usan Chromium (E2E) y Edge (playwright-cli).
- La skill global `playwright-cli` vive en `~\.agents\skills\playwright-cli`.
