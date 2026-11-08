# Estado de implementación

Actualizado tras el **cierre del Frente 1** (coherencia de navegación,
documentación y metadatos), previo a la aprobación del backend.

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
en dashboard, proyectos, historial, monitor, alertas, actividad y configuración.
También verifica que el primer Tab enfoca el enlace de salto.

## Pendiente inmediato

- Validación manual con lectores de pantalla y navegador real más allá de axe.
- Portada social y metadata del repositorio en GitHub.
- Confirmar el workflow CI en GitHub Actions tras el push.

## Pendiente posterior

- **Fases 5–7:** API Express, Prisma + PostgreSQL, adaptador HTTP y despliegue.

## Bloqueos conocidos

- Ninguno funcional. El entorno local define `NODE_ENV=production`, por lo que
  hay que instalar con `npm install --include=dev` y ejecutar las pruebas con
  `NODE_ENV=test`.
- El cambio a esquema 2 / semilla 3 fuerza una resiembra del dataset demo y
  descarta ediciones locales previas (comportamiento esperado del entorno mock).
- La instalación de Google Chrome para Playwright requiere privilegios de
  administrador; se usan Chromium (E2E) y Edge (playwright-cli).
- La skill global `playwright-cli` vive en `~\.agents\skills\playwright-cli`.
