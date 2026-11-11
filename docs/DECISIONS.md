# Decisiones técnicas (ADR cortos)

## ADR-001 · Tailwind CSS v4 con tokens en CSS

**Contexto:** se necesita un design system propio y shadcn/ui.
**Decisión:** Tailwind v4 vía `@tailwindcss/vite`, tokens en `@theme inline` y CSS
variables (`styles/tokens.css`).
**Consecuencia:** sin `tailwind.config.js`; los tokens son la única fuente de
verdad y se reutilizan en gráficos.

## ADR-002 · shadcn/ui sobre Base UI

**Contexto:** el CLI actual de shadcn genera primitivas accesibles sobre Base UI.
**Decisión:** adoptar esa variante y adaptar el helper `cn` propio
(`clsx` + `tailwind-merge`) en lugar del paquete `cn`.
**Consecuencia:** componentes accesibles copiados al repo; sin dependencia opaca.

## ADR-003 · TypeScript 6 en lugar de 7

**Contexto:** el scaffold instaló TypeScript 7, pero `typescript-eslint` todavía
no lo soporta.
**Decisión:** fijar TypeScript 6.x para mantener ESLint con tipado real.
**Consecuencia:** se elimina `baseUrl` (obsoleto en TS 7) y se usan `paths`
relativos; migrar a TS 7 cuando el ecosistema lo soporte.

## ADR-004 · Dinero en céntimos enteros

**Decisión:** todos los montos se guardan como enteros de céntimos y se formatean
con `Intl.NumberFormat('es-PE', 'PEN')`.
**Consecuencia:** sin errores de coma flotante; coincide con lo previsto para
`numeric`/`decimal` en PostgreSQL.

## ADR-005 · Dataset determinista con reloj fijo

**Decisión:** semilla `20261031`, PRNG mulberry32 y fecha de referencia
`2026-10-31` (`DEMO_REFERENCE_DATE`). Todo el dataset es relativo a esa fecha.
**Consecuencia:** el demo no envejece ni cambia entre sesiones; las pruebas son
reproducibles. La resiembra ocurre si cambia `seedVersion` o `referenceDate`.

## ADR-006 · IndexedDB vía `idb`

**Contexto:** 50 proyectos con alertas y actividad, más versiones futuras.
**Decisión:** IndexedDB (`idb`, ~3 kB) detrás de repositorios asíncronos.
**Consecuencia:** mayor capacidad que `localStorage` y persistencia real entre
recargas. El reset demo se implementa reescribiendo el dataset.

## ADR-007 · Rutas y gráficos con carga diferida

**Decisión:** `React.lazy` por pantalla, gráficos en chunks propios y vendors
separados.
**Consecuencia:** el primer render del shell no depende de Recharts; mejor caché
al desplegar.

## ADR-008 · Módulos pendientes visibles, no simulados

**Contexto:** durante las fases tempranas existían rutas aún sin implementar.
**Decisión:** las rutas de Fases 2–4 se completaron y no queda ninguna pantalla
simulada; cada botón navega o ejecuta una acción real, o está deshabilitado con
explicación.
**Consecuencia:** no hay pantallas vacías ni funcionalidad ficticia. Las fases
5–7 (backend y PostgreSQL) permanecen fuera del frontend hasta su aprobación.

## ADR-009 · Apariencia por clases y tokens, sin duplicar paletas

**Contexto:** se necesita un modo oscuro propio sin reescribir componentes ni
provocar flashes al cargar.
**Decisión:** preferencia `light | dark | system` en `localStorage`
(`trazo:theme`), clase `.dark` en `<html>`, tokens semánticos en `tokens.css` y
script inline previo al bundle. El `ThemeProvider` resuelve el sistema y
escucha `prefers-color-scheme`/`storage`.
**Consecuencia:** los componentes consumen los mismos tokens en ambos temas; el
contraste AA se prueba por separado para `:root` y `.dark`.

## ADR-010 · Submenús con rutas reales

**Contexto:** la navegación debía crecer en jerarquía sin inventar pantallas.
**Decisión:** `nav-items.ts` modela cada hijo con un `href` obligatorio.
Archivados apunta a `/projects?archivados=solo` y el historial global de
versiones a `/activity?accion=version.created`.
**Consecuencia:** el estado activo se calcula con `pathname` + query params y
no existen entradas de menú deshabilitadas.

## ADR-011 · Reportes sin dependencias de hojas de cálculo

**Contexto:** M06 exige exportar proyectos y alertas a CSV/XLSX respetando los
filtros activos, además de un resumen ejecutivo en PDF, todo en el frontend.
**Decisión:** construir el reporte como un `ReportDocument` puro; serializar CSV
nativo con BOM UTF-8 y escapado RFC 4180; generar XLSX como paquete OOXML mínimo
comprimido con `fflate`; y producir el PDF con la impresión del navegador.
**Consecuencia:** sin librerías pesadas ni binarios opacos; los archivos abren en
Excel y LibreOffice, las celdas numéricas conservan su tipo y las
transformaciones se prueban en Vitest. La interfaz declara que el PDF depende del
diálogo de impresión del navegador.
