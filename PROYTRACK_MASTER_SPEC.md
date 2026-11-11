# PROYTRACK — Documento maestro de producto y desarrollo

> **Versión:** 1.2 · **Estado:** especificación inicial · **Modalidad:** proyecto personal de portafolio, demo funcional con datos ficticios claramente identificados.
>
> **Cambio v1.2 (2026-11-11):** el motor de base de datos objetivo pasa de PostgreSQL a **SQL Server** (ADR-012), con Prisma como ORM y dinero en céntimos enteros (`INT`). El frontend F1–F4 y los reportes ya están completos.
>
> **Instrucción principal para CMDC / agente desarrollador:** Implementar **PRIMERO EL FRONTEND** en React + TypeScript, con interfaz premium, flujos funcionales y datos mock persistidos localmente. **No construir backend ni conectar SQL Server hasta aprobar el frontend**. Diseñar contratos y capas de acceso a datos que permitan reemplazar mocks por API REST sin reescribir las vistas. No afirmar que una función existe si es solo visual.

---

## 1. Resumen ejecutivo

**Nombre:** ProyTrack  
**Descriptor:** Project Management & Intelligence  
**Eslogan:** Tus proyectos bajo control.  
**Propuesta de valor:** Centralizar la gestión de proyectos empresariales, visualizar avances y presupuestos, detectar automáticamente cambios relevantes y convertirlos en alertas accionables e indicadores ejecutivos.

ProyTrack es una plataforma SaaS conceptual para gerentes de proyectos, analistas, líderes de equipo y responsables de operaciones. La demo utilizará información ficticia pero coherente, y debe comportarse como un producto empresarial auténtico. Su funcionalidad distintiva es comparar versiones de un proyecto y explicar cambios presupuestales, de fechas, estado, responsable y avance.

### 1.1 Visión
Ser una plataforma de referencia para que equipos y empresas tengan visibilidad clara, oportuna y confiable sobre el estado y evolución de sus proyectos, anticipándose a desviaciones y tomando decisiones fundamentadas en datos.

### 1.2 Misión
Facilitar el seguimiento y control de proyectos mediante una experiencia intuitiva, datos centralizados, trazabilidad de modificaciones y alertas automáticas que transformen actualizaciones operativas en información útil.

### 1.3 Objetivo general
Desarrollar una aplicación web full stack de gestión inteligente de proyectos empresariales, iniciando con un frontend de alta calidad y posteriormente incorporando backend y persistencia SQL Server, que permita monitorear cambios y riesgos con indicadores visuales.

### 1.4 Objetivos específicos
1. Gestionar un portafolio de proyectos y sus datos esenciales.
2. Ofrecer dashboard ejecutivo con KPIs, gráficos y filtros.
3. Detectar diferencias entre estados sucesivos de proyectos.
4. Registrar historial de versiones y eventos de cambio.
5. Emitir alertas explicables basadas en reglas configurables.
6. Construir una demo interactiva, accesible, responsiva y reproducible.
7. Separar presentación, dominio y datos para facilitar el paso de mocks a SQL Server.

### 1.5 Audiencia
- **Gerente de proyectos:** visión del portafolio, desviaciones, alertas y decisiones.
- **Líder de equipo:** seguimiento de proyectos asignados, responsables y cronogramas.
- **Analista:** historial, comparaciones, reportes y tendencias.
- **Reclutador / visitante demo:** explorar el producto sin registro y ejecutar escenarios guiados.

### 1.6 Alcance y límites
**Incluye:** proyectos, dashboard, cambios, alertas, historial, filtros, demo interactiva y estados de interfaz.  
**No incluye en primera etapa:** backend, autenticación real, pagos, integraciones externas, IA generativa, multiempresa real, notificaciones por correo, colaboración simultánea o datos de empresas reales.  
**Posterior:** reportes, permisos reales, tareas/hitos detallados, importaciones, integraciones, jobs automáticos y organizaciones múltiples.

---

## 2. Posicionamiento y personalidad

- **Personalidad:** profesional, moderna, precisa, clara, confiable y sobria.
- **Tono:** directo y orientado a decisiones; evitar jerga innecesaria.
- **Promesa:** cada cambio importante se identifica y se puede explicar.
- **Diferencial:** no solo muestra estados actuales; conserva versiones y hace visibles las modificaciones.
- **Principio:** una interfaz hermosa no sustituye comportamiento funcional.
- **Transparencia:** rotular siempre `Entorno de demostración · Datos simulados`.

### 2.1 Microcopy
- Título del dashboard: `Resumen general`
- Subtítulo: `Una vista clara del estado de tu portafolio.`
- CTA principal: `Nuevo proyecto`
- CTA demo: `Simular actualización`
- Vacío: `Aún no hay proyectos que coincidan con tus filtros.`
- Éxito: `Proyecto actualizado. Se registró una nueva versión.`
- Alerta: `El presupuesto aumentó un 20 % respecto a la versión anterior.`
- Error: `No pudimos guardar los cambios. Inténtalo nuevamente.`

---

## 3. Identidad visual y design system

### 3.1 Paleta de marca (light mode prioritario)

| Token | HEX | Uso |
|---|---|---|
| `--brand-navy` | `#0F172A` | Sidebar, títulos oscuros, elementos de marca |
| `--brand-primary` | `#2563EB` | Botones principales, enlaces, datos activos |
| `--brand-primary-hover` | `#1D4ED8` | Hover de CTA |
| `--canvas` | `#F8FAFC` | Fondo de la aplicación |
| `--surface` | `#FFFFFF` | Tarjetas, tablas, paneles |
| `--text-primary` | `#0F172A` | Texto principal |
| `--text-secondary` | `#64748B` | Texto secundario |
| `--border` | `#E2E8F0` | Bordes y divisores |
| `--success` | `#10B981` | Completado, variación positiva |
| `--warning` | `#F59E0B` | Riesgo moderado, advertencia |
| `--danger` | `#EF4444` | Errores, riesgos críticos |
| `--info` | `#3B82F6` | Información, estados neutrales |
| `--focus` | `#93C5FD` | Anillo de enfoque |

**Regla:** los estados nunca se comunican solo mediante color; añadir icono y texto. Usar rojo únicamente para señales negativas. No colorear arbitrariamente las series de datos: mantener consistencia semántica.

### 3.2 Tipografía
- Principal: **Inter** (alternativa Geist).
- Títulos: 600–700 de peso; cuerpo 400–500.
- Escala sugerida: 12, 14, 16, 18, 20, 24, 30, 36 px.
- Altura de línea: 1.4–1.6 para texto de lectura.
- Números de KPIs: cifras tabulares para evitar saltos.

### 3.3 Componentes visuales
- Radio: 8 px controles, 12 px tarjetas, 16 px paneles grandes.
- Sombras discretas; preferir borde `#E2E8F0` a sombras pesadas.
- Espaciado basado en múltiplos de 4 px (4/8/12/16/24/32).
- Sidebar oscura de 248–264 px en desktop, colapsable; header de 64–72 px.
- Contenido con máximo 1440–1600 px, márgenes 24–32 px desktop.
- Tarjetas de KPIs con título, valor, variación contextual e icono discreto.
- Iconografía: Lucide React.
- Animaciones breves (150–250 ms), respetando `prefers-reduced-motion`.
- Estados hover, focus, disabled, loading, success y error para todos los controles.
- Light mode obligatorio; dark mode opcional después de completar el MVP.

### 3.4 Responsive
- Desktop >= 1280 px: sidebar persistente, dashboard de 4 KPIs.
- Tablet 768–1279 px: sidebar compacta, KPIs 2 columnas.
- Mobile < 768 px: navegación en drawer, tarjetas 1 columna, tablas con scroll horizontal controlado o vista de tarjetas.
- No cortar datos críticos ni ocultar acciones sin alternativa accesible.

### 3.5 Accesibilidad
- WCAG 2.2 AA como objetivo de diseño.
- Navegación por teclado, foco visible, etiquetas de formulario y mensajes de error asociados.
- Contraste mínimo 4.5:1 en texto normal cuando aplique.
- Gráficos con leyendas y resúmenes textuales.
- Confirmación para acciones destructivas.

---

## 4. Navegación y mapa de pantallas

```text
ProyTrack
├── Resumen general          /dashboard
├── Proyectos                /projects
│   ├── Listado              /projects
│   ├── Crear                /projects/new
│   └── Detalle              /projects/:id
│       ├── Resumen          /projects/:id?tab=overview
│       ├── Historial        /projects/:id?tab=history
│       └── Comparar         /projects/:id?tab=compare
├── Monitor de cambios       /monitor
├── Centro de alertas        /alerts
├── Actividad                /activity
├── Configuración demo       /settings
└── Página no encontrada     /*
```

**Sidebar:** logo + nombre, navegación principal, sección inferior con ajustes, perfil demo y etiqueta de entorno.  
**Header:** breadcrumb, buscador opcional, fecha de referencia de los datos, icono de notificaciones y perfil ficticio.  
**Todas las rutas** deben tener diseño real, navegación funcional y estados de carga/vacío/error.

---

## 5. Módulos y requisitos funcionales

### M01. Dashboard ejecutivo — MVP

**KPIs:** total de proyectos, en ejecución, completados, bloqueados, con retraso, alertas abiertas, presupuesto planificado y presupuesto actual.

**Visualizaciones:**
- Evolución de proyectos por mes (serie temporal).
- Distribución por estado (donut o barras).
- Presupuesto inicial vs. actual (barras comparativas).
- Proyectos que requieren atención (tabla priorizada).
- Actividad reciente (últimos cambios).

**Interacciones:** filtros por periodo, estado, prioridad, responsable y sector; navegación desde tarjeta a listado filtrado; tooltips y estados vacíos. Los KPIs deben recalcularse a partir de la fuente de datos, no estar escritos a mano.

### M02. Gestión de proyectos — MVP

**Campos:** identificador, código, nombre, descripción, sector, cliente ficticio, responsable, estado, prioridad, presupuesto inicial, presupuesto actual, moneda, progreso (%), fecha de inicio, fecha prevista, fecha de cierre real opcional, etiquetas, fecha de creación/actualización.

**Operaciones:** listar, buscar, filtrar, ordenar, crear, editar, archivar, consultar detalle. Evitar eliminación física en MVP; usar archivado lógico. Validar valores y fechas; prevenir presupuestos negativos y progreso fuera de 0–100.

**Estados sugeridos:** `planned`, `in_progress`, `on_hold`, `completed`, `cancelled`. El retraso es un indicador calculado, no necesariamente un estado separado.

**Prioridades:** baja, media, alta, crítica.

**Detalle:** cabecera, KPIs específicos, descripción, información financiera, progreso, cronograma, responsable, alertas relacionadas, actividad y comparación de versiones.

### M03. Monitor de cambios — MVP, función distintiva

- Comparar la versión anterior con la nueva al editar un proyecto.
- Detectar diferencias en presupuesto, fechas, estado, progreso, prioridad y responsable.
- Guardar un `ProjectVersion` inmutable y una lista de `ChangeEvent` por campo modificado.
- Mostrar `antes → después`, fecha, actor y motivo si se ingresó.
- Permitir filtrar por tipo de cambio, proyecto, severidad y fecha.
- No generar versión adicional si los datos normalizados son idénticos.
- Mantener identificadores de evento estables para evitar duplicaciones.
- En la fase frontend, implementar la lógica sobre un repositorio mock con persistencia local y comportamiento determinista.

### M04. Centro de alertas — MVP

**Tipos:** incremento presupuestal, fecha postergada, proyecto vencido, estado bloqueado y cambio crítico de prioridad.

**Severidad:** informativa, advertencia, crítica.

**Estados:** abierta, revisada, resuelta.

**Reglas iniciales demostrativas:**
- Incremento de presupuesto actual respecto al anterior > 10 % → advertencia.
- Incremento > 20 % → crítica.
- Nueva fecha de entrega posterior a la anterior → advertencia.
- Fecha de entrega anterior a la fecha de referencia y progreso < 100 %, si no está cancelado/completado → advertencia.
- Estado cambia a `on_hold` → crítica.
- Prioridad cambia a crítica → advertencia.

**Detalles de cálculo:** porcentaje = `(nuevo - anterior) / anterior * 100`. Si anterior = 0, no calcular porcentaje; mostrar `incremento desde cero` y aplicar regla específica. Una misma actualización no debe crear alertas duplicadas para la misma regla y versión. Alertas derivadas de tiempo deben evaluarse respecto a una fecha de referencia controlada.

**Acciones:** ver proyecto, revisar alerta, marcar resuelta, filtrar y ordenar. Guardar estado de revisión en la fuente mock.

### M05. Historial y auditoría — MVP

- Timeline cronológica de eventos y versiones.
- Autor del cambio (identidad demo), fecha/hora, tipo de acción y diferencias.
- Vista de comparación de dos versiones.
- No permitir modificar o borrar eventos históricos desde la UI.
- Diferenciar `simulado`, `manual` y `sistema` como origen del evento.

### M06. Reportes — V1.1

- Resumen ejecutivo exportable a PDF.
- Exportación CSV/XLSX de proyectos y alertas.
- Los archivos deben respetar los filtros activos y mostrar periodo, fecha y marca de datos simulados.

### M07. Usuarios y roles — V1.1

- Login real, hash de contraseñas, sesiones seguras, permisos por rol y organización.
- Roles: administrador, gerente, analista, lector.
- En frontend MVP usar un perfil demo fijo; no fingir seguridad real ni controles efectivos de autorización.

---

## 6. Flujo estrella para la demostración

1. Usuario abre `/dashboard` y observa datos demo coherentes.
2. Ingresa a `/projects` y abre un proyecto.
3. Cambia presupuesto de **S/ 2,400,000** a **S/ 2,880,000** (+20 %).
4. Guarda; se actualiza el proyecto, se crea una versión y un evento de cambio.
5. El motor evalúa reglas y crea la alerta correspondiente (advertencia con regla `>10 %`; la regla crítica `>20 %` no aplica a exactamente 20 %, salvo que el umbral se configure como `>=20 %`).
6. Se muestra toast de éxito, historial y comparador `antes / después`.
7. Dashboard y centro de alertas reflejan el cambio sin recargar la página.
8. Se puede restablecer la demo a su estado inicial.

**Criterio de calidad:** esta secuencia debe funcionar de extremo a extremo con mocks antes de implementar backend.

---

## 7. Arquitectura — enfoque frontend-first

### 7.1 Etapa 1: frontend autónomo

**Stack obligatorio:** React + Vite + TypeScript, Tailwind CSS, shadcn/ui, Lucide React, React Router, TanStack Query, TanStack Table, Recharts, React Hook Form + Zod, Vitest + React Testing Library, Playwright.

**Datos:** fixtures TypeScript/JSON, generador reproducible con semilla fija y repositorio mock asíncrono. Persistir el estado demo en IndexedDB (recomendado) o localStorage con versionado del esquema. Simular latencia moderada solo en desarrollo; ofrecer reset de demo.

**Arquitectura por funcionalidades:** componentes UI → hooks/casos de uso → interfaces de repositorio → implementación mock. La UI nunca importa directamente los archivos JSON. Mantener tipos y contratos estables para sustituir repositorio mock por adaptador HTTP.

```text
src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   ├── providers.tsx
│   └── layouts/
├── components/
│   ├── ui/                   # shadcn/ui
│   ├── shared/               # PageHeader, EmptyState, StatusBadge, etc.
│   └── charts/
├── features/
│   ├── dashboard/
│   ├── projects/
│   ├── monitoring/
│   ├── alerts/
│   ├── activity/
│   └── settings/
├── domain/
│   ├── models/
│   ├── rules/
│   └── services/
├── data/
│   ├── contracts/            # ProjectRepository, AlertRepository...
│   ├── mock/                 # fixtures, seed, adapters, storage
│   └── http/                 # reservar para etapa backend
├── hooks/
├── lib/
├── styles/
└── tests/
```

### 7.2 Etapa 2: backend y SQL Server

- **Backend:** Node.js + Express + TypeScript; validación con Zod.
- **Base de datos:** SQL Server + Prisma ORM (conector `sqlserver`). En desarrollo,
  instancia local en `localhost,1433` con la base `Trazo`; el acceso desde el
  agente usa el MCP `sqlserver` (login de mínimo privilegio).
- **Estilo:** monolito modular; rutas/controladores → servicios de dominio → repositorios.
- **API:** REST JSON bajo `/api/v1`.
- **Persistencia:** transacciones para editar proyecto, crear versión, registrar eventos y alertas.
- **Scheduler:** job de actualización de escenarios/importaciones, con idempotencia y registro de ejecuciones.
- **Seguridad posterior:** autenticación, autorización por organización, rate limiting, logging y validación del lado servidor.
- **Despliegue tentativo:** frontend en Vercel; backend en hosting Node; SQL Server administrado. Verificar límites/costos antes de seleccionar proveedor.

```text
[React UI]
    ↓
[Feature hooks / TanStack Query]
    ↓
[Repository interfaces]
    ├── [Mock adapters + IndexedDB]       ← ETAPA 1
    └── [HTTP adapters]                    ← ETAPA 2
             ↓
       [Express REST API]
             ↓
       [Domain services]
             ↓
       [Prisma ORM]
             ↓
       [SQL Server]
```

### 7.3 Entidades previstas

| Entidad | Campos principales |
|---|---|
| `Project` | id, code, name, description, sector, ownerId, status, priority, initialBudget, currentBudget, currency, progress, startDate, dueDate, completedAt, createdAt, updatedAt, archivedAt |
| `ProjectVersion` | id, projectId, versionNumber, snapshot, changedAt, changedBy, source |
| `ChangeEvent` | id, versionId, projectId, field, oldValue, newValue, changeType |
| `Alert` | id, projectId, versionId?, ruleId, severity, status, title, description, createdAt, reviewedAt?, resolvedAt? |
| `User` | id, name, email, role, avatarUrl? |
| `ActivityLog` | id, projectId?, actorId?, action, source, createdAt, metadata |
| `RuleConfig` | id, ruleKey, enabled, threshold?, severity |
| `DemoScenario` | id, name, description, changes, seedVersion |

**Notas:** usar `UNIQUEIDENTIFIER` para los identificadores, `DATETIME2` en UTC y dinero en céntimos enteros (`INT`) en SQL Server. Los snapshots deben preservar una representación consistente y serializable. Los índices, claves foráneas y restricciones se diseñarán al implementar la base. En mocks, evitar cálculos financieros con floats sin normalización.

### 7.4 Contratos de repositorios sugeridos

```ts
interface ProjectRepository {
  list(query: ProjectQuery): Promise<Paginated<Project>>;
  getById(id: string): Promise<Project | null>;
  create(input: CreateProjectInput): Promise<Project>;
  update(id: string, input: UpdateProjectInput): Promise<Project>;
  archive(id: string): Promise<void>;
  listVersions(id: string): Promise<ProjectVersion[]>;
}

interface AlertRepository {
  list(query: AlertQuery): Promise<Paginated<Alert>>;
  updateStatus(id: string, status: AlertStatus): Promise<Alert>;
}
```

**Importante:** coordinar el cambio de proyecto y la generación de versiones/eventos/alertas en un caso de uso único, no desde varios componentes visuales independientes.

### 7.5 Endpoints planeados para etapa 2

```text
GET    /api/v1/dashboard/summary
GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/:id
PATCH  /api/v1/projects/:id
POST   /api/v1/projects/:id/archive
GET    /api/v1/projects/:id/versions
GET    /api/v1/projects/:id/changes
GET    /api/v1/alerts
PATCH  /api/v1/alerts/:id/status
GET    /api/v1/activity
POST   /api/v1/demo/reset         # solo entorno demo protegido
POST   /api/v1/demo/scenarios/:id/run
```

---

## 8. Diseño de datos demo

**Dataset recomendado:** 50 proyectos de sectores tecnología, construcción y consultoría; 8–12 responsables ficticios; presupuestos, cronogramas y estados coherentes; entre 2 y 6 versiones históricas por una parte de los proyectos; alertas y actividad relacionadas.

**Principios:**
- Datos ficticios, explícitamente rotulados.
- IDs estables, generador determinista y semilla documentada.
- Fechas relativas a una fecha de referencia fija o a un reloj demo controlado para evitar que el demo envejezca inesperadamente.
- Consistencia: progreso 100 % en completados; fechas plausibles; presupuesto y versiones reconciliables.
- Casos normales, extremos y negativos: presupuesto desde cero, cambios sin diferencias, fechas inválidas, proyectos bloqueados, alertas duplicadas, archivos vacíos.
- Acciones demo: `Simular actualización`, `Cargar escenario de retrasos`, `Cargar escenario de sobrecostos`, `Restaurar datos`.
- Confirmar restauración porque elimina cambios locales del visitante.

### 8.1 Ejemplos de proyectos
- Implementación de ERP corporativo.
- Modernización de infraestructura tecnológica.
- Construcción de centro logístico.
- Migración a servicios cloud.
- Transformación de procesos comerciales.
- Remodelación de sede administrativa.
- Implementación de sistema de inventarios.
- Automatización de reportes financieros.

### 8.2 Simulación de monitoreo diario
En la etapa frontend, ofrecer un **simulador de actualización** con escenarios controlados. No afirmar que corre un proceso en servidor cuando la app está cerrada. La ejecución diaria real y los jobs persistentes quedan para la etapa backend.

---

## 9. Especificación de pantallas

### 9.1 Dashboard `/dashboard`
- Encabezado con título, descripción, selector de periodo y CTA `Nuevo proyecto`.
- Fila de cuatro KPIs principales; segunda fila opcional con presupuesto y alertas.
- Gráfico de evolución + distribución por estados.
- Tabla `Proyectos que requieren atención` con nombre, responsable, estado, riesgo y acción.
- Panel `Actividad reciente`.
- Todos los gráficos vinculados a datos reales del repositorio mock.

### 9.2 Proyectos `/projects`
- Tabla desktop con columnas: código, nombre, responsable, estado, prioridad, progreso, presupuesto, entrega y acciones.
- Búsqueda por nombre/código; filtros combinables; ordenamiento; paginación.
- Botón `Nuevo proyecto`; menú contextual con `Ver`, `Editar`, `Archivar`.
- Filtros reflejados en query params de URL.

### 9.3 Crear / editar proyecto
- Formulario por secciones: información general, presupuesto, cronograma y asignación.
- Validación Zod, errores inline, bloqueo al guardar y aviso de éxito.
- Confirmación de salida si hay cambios sin guardar.
- Diferenciar `presupuesto inicial` (línea base) y `presupuesto actual`.

### 9.4 Detalle `/projects/:id`
- Header con nombre, código, estado, responsable y CTA `Editar`.
- KPIs: presupuesto, variación, progreso, fecha de entrega y alertas abiertas.
- Pestañas: `Resumen`, `Historial`, `Comparar versiones`.
- Timeline de actividad y cambios con origen, fecha y actor.
- Comparador con valores anteriores/nuevos resaltados y explicación de reglas.

### 9.5 Monitor `/monitor`
- Feed de cambios agrupado por fecha/proyecto.
- Filtros por campo, periodo, severidad, proyecto y origen.
- Panel de detalle de cambio; enlace a proyecto y versión.
- CTA `Simular actualización` disponible solo en demo.

### 9.6 Alertas `/alerts`
- Contadores abiertas, críticas, revisadas y resueltas.
- Lista o tabla con severidad, título, proyecto, fecha y estado.
- Acciones para revisar/resolver; navegación a proyecto.
- Mostrar regla que disparó la alerta, no usar etiquetas vagas como `IA detectó`.

### 9.7 Actividad `/activity`
- Registro de eventos con filtros por proyecto, usuario demo, fecha y acción.
- Timeline o tabla con paginación.

### 9.8 Configuración `/settings`
- Perfil demo (solo visual, claramente identificado).
- Preferencias de visualización (tema opcional, densidad de tablas).
- Umbrales de reglas configurables en la demo si hay tiempo.
- Restablecer datos demo y consultar versión del dataset.

---

## 10. Calidad, pruebas y criterios de aceptación

### 10.1 Calidad de frontend
- TypeScript estricto; evitar `any` innecesario.
- Componentes reutilizables y sin lógica de negocio duplicada.
- Estados loading, empty, error, success y disabled.
- Manejo de errores y boundaries por pantalla.
- Diseño responsive en 375, 768, 1280 y 1440 px.
- Navegación y formularios accesibles.
- No dejar botones decorativos ni rutas vacías.
- Sin errores en consola en flujos normales.
- Lint, formato, tests y build correctos.

### 10.2 Pruebas unitarias
- Comparación de versiones y detección de campos modificados.
- Cálculo de variación presupuestal y caso anterior = 0.
- Evaluación de umbrales exactos (10 %, 20 %).
- Retrasos respecto a fecha de referencia.
- Idempotencia de generación de alertas.
- Validación de campos y fechas.

### 10.3 Pruebas E2E
1. Abrir dashboard y visualizar KPIs.
2. Crear proyecto y encontrarlo en listado.
3. Editar presupuesto y verificar nueva versión.
4. Ver diferencia antes/después y alerta generada.
5. Revisar alerta y verificar cambio de estado.
6. Filtrar proyectos y mantener filtros en URL.
7. Recargar navegador y conservar cambios demo.
8. Restaurar demo y recuperar dataset inicial.
9. Verificar navegación móvil y teclado.

### 10.4 Criterio de salida de la etapa frontend
**No avanzar a backend hasta que:**
- Todas las pantallas MVP estén navegables y visualmente consistentes.
- CRUD y archivado funcionen en el repositorio mock.
- Comparador, versionado, alertas y dashboard estén conectados entre sí.
- Persistencia local y reset demo funcionen.
- Existan pruebas unitarias y al menos el flujo E2E estrella.
- `npm run build`, `npm run lint` y `npm run test` finalicen correctamente.
- README incluya instrucciones de ejecución, arquitectura, limitaciones y capturas reales.

---

## 11. Roadmap de ejecución

| Fase | Prioridad | Entregable |
|---|---|---|
| F0. Fundamentos | Alta | Vite + React + TS, router, design tokens, layouts, componentes base |
| F1. Frontend visual | Alta | Dashboard y todas las pantallas con mocks coherentes y responsive |
| F2. Flujos funcionales | Alta | CRUD mock, filtros, formularios, persistencia local |
| F3. Inteligencia de cambios | Alta | Versiones, comparador, reglas y alertas sincronizadas |
| F4. Pulido y QA | Alta | Accesibilidad, estados UI, pruebas, demo guiada, README |
| **Hito: aprobación del frontend** | **Bloqueante** | **Revisión visual y funcional antes de backend** |
| F5. Backend | Posterior | API Express, servicios, validaciones, Prisma con SQL Server |
| F6. SQL Server | Posterior | Modelo relacional, migraciones, seeds, transacciones |
| F7. Integración | Posterior | Adaptador HTTP, autenticación si procede, despliegue y pruebas |
| F8. Evolución | Opcional | Reportes, roles, organizaciones, scheduler real, integraciones |

**Orden estricto:** diseño → frontend completo → revisión → backend → base de datos → integración. SQL Server es la base objetivo, pero no una dependencia de la primera entrega.

---

## 12. Estructura sugerida del repositorio

```text
proytrack/
├── README.md
├── docs/
│   ├── PRODUCT_SPEC.md
│   ├── ARCHITECTURE.md
│   ├── DESIGN_SYSTEM.md
│   └── DEMO_GUIDE.md
├── frontend/
│   ├── package.json
│   ├── src/
│   └── public/
├── backend/                     # crear solo en fase posterior
├── .gitignore
└── LICENSE
```

**README mínimo:** descripción, screenshots reales, funcionalidades, stack, cómo ejecutar, cómo restablecer demo, arquitectura, datos ficticios, limitaciones, pruebas, roadmap y enlace al demo.

---

## 13. Instrucciones de ejecución para el agente CMDC

### Rol
Actúa como ingeniero frontend senior, diseñador de producto SaaS B2B y arquitecto de software. Construye un frontend funcional, mantenible, atractivo y listo para integrarse posteriormente con un backend Node.js y SQL Server.

### Reglas obligatorias
1. **Primero frontend. No implementar backend ni SQL Server todavía.**
2. Priorizar calidad visual profesional, consistencia y usabilidad sin sacrificar funcionamiento.
3. Implementar por fases pequeñas; comprobar build y pruebas al finalizar cada fase.
4. No usar componentes falsos: cada botón visible debe navegar, ejecutar una acción real de la demo o estar explícitamente deshabilitado con explicación.
5. Todos los KPIs y gráficos deben calcularse desde el mismo estado mock que proyectos, versiones y alertas.
6. Separar datos, dominio y presentación; evitar acoplar UI a JSON estático.
7. Utilizar mocks reproducibles y persistencia local; identificar datos simulados.
8. Mantener una interfaz de repositorios compatible con una futura API REST.
9. No incorporar IA generativa, microservicios, pagos ni complejidad no solicitada.
10. Documentar decisiones, supuestos, cambios y funcionalidades pendientes.
11. No añadir librerías por moda; justificar dependencias adicionales.
12. Proteger la experiencia: estados de carga, errores, vacíos, confirmaciones y accesibilidad.
13. Mantener nombres de código en inglés y textos de interfaz en español.
14. No exponer secretos ni colocar credenciales reales en el repositorio.
15. No iniciar etapa backend sin aprobación explícita del propietario del proyecto.

### Primera tarea del agente
1. Leer este documento completo.
2. Proponer estructura final del frontend, dependencias y plan de pantallas.
3. Crear proyecto React + Vite + TypeScript con Tailwind y shadcn/ui.
4. Configurar tokens de diseño, layout, sidebar, header, navegación y componentes base.
5. Construir primero **Dashboard** y **Proyectos** con dataset mock coherente.
6. Mostrar resultados y comprobar responsive antes de continuar con monitor, alertas e historial.
7. Registrar avance en un archivo `docs/IMPLEMENTATION_STATUS.md` con tareas terminadas, pendientes y bloqueos.

### Definición de éxito
Una persona que nunca ha visto ProyTrack puede entrar a la demo, entender el estado del portafolio, abrir y editar un proyecto, observar la detección de un cambio, revisar la alerta y consultar el historial, todo en una interfaz pulida y sin depender de un backend real.

---

## 14. Guion de demo para reclutadores (2–3 minutos)

1. **0:00–0:20:** presentar dashboard y métricas.
2. **0:20–0:45:** explorar portafolio y filtros.
3. **0:45–1:20:** abrir proyecto y cambiar presupuesto/fecha.
4. **1:20–1:50:** enseñar comparación de versiones y alerta.
5. **1:50–2:20:** volver al dashboard y mostrar indicadores actualizados.
6. **2:20–3:00:** explicar arquitectura frontend-first, pruebas y transición prevista a SQL Server.

**Mensaje para CV (una vez implementado):** `Desarrollé ProyTrack, plataforma de gestión de proyectos con dashboard analítico, historial de versiones y motor de detección de cambios y alertas; frontend en React/TypeScript y arquitectura desacoplada preparada para API REST y SQL Server.`

---

## 15. Decisiones pendientes (no bloquean el frontend)

- Nombre definitivo y disponibilidad de marca/dominio.
- Identidad gráfica final y logotipo vectorial.
- Proveedor de hosting y costos de infraestructura.
- Autenticación y multiempresa reales.
- Integraciones con fuentes externas y scheduler real.
- Formato final de exportación de reportes.



---

## 16. Estrategia Git y commits por tarea (OBLIGATORIA PARA CMDC)

**Objetivo:** construir un historial público honesto, legible y profesional que permita a un reclutador revisar la evolución de ProyTrack. **No fabricar actividad ni crear commits vacíos para colorear el gráfico de contribuciones.**

### 16.1 Regla de trabajo

1. Antes de cada tarea, definir objetivo, archivos afectados y criterio de aceptación.
2. Implementar **una unidad lógica y revisable**: componente, pantalla, funcionalidad, prueba, refactor o documentación.
3. Ejecutar las verificaciones aplicables (`lint`, `typecheck`, pruebas y/o build); corregir fallos antes de confirmar.
4. Revisar `git diff` y `git status`; excluir secretos, `.env`, credenciales, artefactos compilados y dependencias.
5. Crear **un commit significativo por tarea lógica terminada**, salvo que dividirla en varios commits independientes mejore la revisión. No hacer commits por cada línea, clic o archivo ni confirmar código roto solo por cumplir una cuota.
6. Mantener el árbol de trabajo ordenado. Registrar en `docs/IMPLEMENTATION_STATUS.md` tarea, resultado, pruebas y hash del commit.
7. **Nunca ejecutar `git push`, publicar el repositorio, crear releases ni modificar ramas remotas sin autorización explícita del propietario.** Los commits locales sí pueden realizarse si el repositorio está inicializado y la identidad Git está correctamente configurada.
8. No reescribir el historial compartido ni usar `--force` sin aprobación. Nunca cambiar fechas de commits, automatizar commits vacíos o suplantar identidades para aparentar actividad.

### 16.2 Convención de mensajes

Usar **Conventional Commits**: `tipo(alcance): descripción breve en imperativo`.

Tipos sugeridos: `feat`, `fix`, `refactor`, `style`, `test`, `docs`, `chore`, `perf`, `ci`.

Ejemplos de tareas reales, **no commits a generar artificialmente**:

```text
chore(app): initialize React and TypeScript workspace
style(theme): define ProyTrack design tokens
feat(layout): add responsive sidebar and top navigation
feat(dashboard): implement project KPI cards
feat(projects): add searchable project table
feat(projects): implement project creation form
feat(monitor): compare project snapshots
feat(alerts): generate alerts from change rules
test(monitor): cover budget variation thresholds
fix(projects): prevent invalid deadline updates
docs(readme): add architecture and demo instructions
ci(checks): run lint, typecheck and tests on pull requests
```

Los mensajes deben describir **exactamente** lo implementado, sin atribuir funcionalidades futuras. Un commit de UI no debe presentarse como una integración real con SQL Server.

### 16.3 Flujo Git sugerido

```bash
git status
git diff --check
npm run lint
npm run build
# Ejecutar pruebas si existen y si el script está configurado.
git add <archivos-relacionados-con-la-tarea>
git diff --cached
git commit -m "feat(dashboard): add project KPI cards"
git log --oneline -5
```

No usar `git add .` a ciegas. Si `user.name` o `user.email` no están configurados, **pedir al propietario sus valores**; nunca inventarlos. Para que una contribución se atribuya correctamente, el correo de autor debe estar asociado/verificado en su cuenta de GitHub (puede usar un correo `noreply` configurado por GitHub). El gráfico de contribuciones también depende de las reglas de GitHub sobre repositorio, rama y tipo de contribución; no prometer que cada commit local producirá un cuadro verde.

### 16.4 Ritmo de entrega

- Al cerrar cada tarea: informar resumen, archivos clave, verificaciones realizadas, hash del commit y siguiente tarea.
- Al cerrar cada fase: mostrar una captura o demo verificable, actualizar documentación y presentar un resumen de los commits.
- Si una tarea no está terminada o falla las verificaciones: informar el bloqueo, **no declarar éxito**.
- No usar una cuota artificial de commits diarios. Priorizar avances genuinos y cambios fáciles de revisar.

## 17. GitHub atractivo para reclutadores y empresas

### 17.1 Repositorio público `proytrack`

**Meta:** que en 30–60 segundos un visitante entienda el problema, vea el producto, encuentre una demo y compruebe la calidad del código.

README recomendado, en este orden:

1. **Hero:** nombre ProyTrack, descriptor breve, problema y propuesta de valor; imagen/banner original del producto.
2. **Enlaces visibles:** `Live Demo`, `Screenshots`, `Architecture`, `Getting Started` (solo habilitar enlaces que existan).
3. **Capturas reales** de dashboard, proyectos, detalle, monitor y alertas; preferir capturas de la aplicación implementada y no renders ficticios.
4. **Demo en 3 pasos:** abrir proyecto, modificar presupuesto, revisar alerta e historial.
5. **Funcionalidades implementadas** con estado verificable; separar claramente `Available`, `In progress` y `Planned`.
6. **Stack:** React, TypeScript, Vite, Tailwind, shadcn/ui; Node.js y SQL Server etiquetados como *planned* hasta que se implementen.
7. **Arquitectura:** diagrama simple de UI → servicios/repositorios mock → persistencia local, con la API/SQL Server como fase posterior.
8. **Instalación:** requisitos, comandos reproducibles y modo demo sin credenciales reales.
9. **Pruebas y calidad:** comandos de lint, typecheck, tests y build; badges CI solo si hay workflows operativos.
10. **Roadmap, decisiones técnicas, limitaciones, licencia y autoría.** Indicar explícitamente que los datos son sintéticos y que se trata de un proyecto personal de demostración.

Archivos recomendados:

```text
README.md
LICENSE                      # Elegir licencia conscientemente
.gitignore
.env.example                 # Solo nombres de variables, sin secretos
.github/workflows/ci.yml    # Cuando existan scripts verificables
.github/ISSUE_TEMPLATE/     # Opcional
.github/PULL_REQUEST_TEMPLATE.md  # Opcional
public/og-cover.png         # Portada original cuando esté creada
docs/ARCHITECTURE.md
docs/IMPLEMENTATION_STATUS.md
docs/DECISIONS.md
docs/screenshots/
```

### 17.2 Presentación visual de GitHub

- Mantener un nombre, descripción y temas del repositorio coherentes: `react`, `typescript`, `project-management`, `dashboard`, `portfolio`, `saas`, `vite` (solo los que correspondan).
- Configurar una imagen social de portada propia, consistente con la paleta de ProyTrack: navy `#0F172A`, azul `#2563EB`, fondo `#F8FAFC`, verde `#10B981` y ámbar `#F59E0B`.
- Usar GIF/video corto del **flujo funcional real** cuando esté implementado, evitando imágenes engañosas o animaciones pesadas.
- Destacar ProyTrack entre los repositorios fijados del perfil y agregar su enlace de demo al perfil cuando exista.
- Opcional: README de perfil GitHub con presentación breve, tecnologías, 2–3 proyectos destacados y contacto profesional; no llenar el perfil con badges decorativos ni métricas que distraigan.
- No colocar logos de empresas como si fueran clientes reales ni inventar usuarios, resultados o métricas de negocio.

### 17.3 Calidad y seguridad antes de publicar

- Comprobar que no se suban secretos, tokens, contraseñas, bases de datos locales ni archivos `.env`.
- Añadir CI para lint, TypeScript, pruebas y build cuando esos scripts estén disponibles.
- Mantener rutas y botones de la demo funcionales; evitar enlaces rotos y funcionalidades simuladas sin etiquetar.
- Usar datos sintéticos deterministas y un botón para restaurar el estado del demo.
- Proporcionar instrucciones claras para reproducir los escenarios de alerta.
- Mantener una rama principal estable; usar ramas de trabajo si ayudan a organizar cambios.

### 17.4 Criterios de aceptación de la presencia en GitHub

- [ ] El README explica el producto en menos de un minuto.
- [ ] Las capturas corresponden a pantallas realmente implementadas.
- [ ] Hay instrucciones de instalación verificadas.
- [ ] Las funcionalidades actuales se distinguen de las futuras.
- [ ] Los commits tienen mensajes específicos y reflejan tareas terminadas.
- [ ] El historial permite seguir la evolución del frontend antes del backend.
- [ ] No hay secretos ni archivos innecesarios versionados.
- [ ] El enlace público de la demo funciona (cuando se publique).
- [ ] El repositorio tiene descripción, temas y portada coherentes.
- [ ] El propietario ha aprobado expresamente cualquier `push` o publicación.

## 18. Instrucción adicional prioritaria para CMDC

> **A partir de la primera tarea del frontend, trabaja con disciplina Git.** Divide el desarrollo en tareas pequeñas, funcionales y comprobables. Por cada tarea lógica completada, ejecuta las verificaciones pertinentes, crea un commit local con Conventional Commits y reporta su hash. Documenta el progreso. Prioriza primero el frontend en React/TypeScript con mocks reales y experiencia visual premium; NO implementes backend ni SQL Server sin aprobación. Prepara un README de alto nivel visual, pero usa capturas reales y no afirmes que hay funciones o integraciones que aún no existen. No generes commits vacíos ni manipules fechas para aumentar contribuciones. **Nunca hagas `git push` ni publiques nada sin mi autorización explícita.**

**Fin del documento.**
