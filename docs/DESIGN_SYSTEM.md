# Design system — Trazo

Implementación: `frontend/src/styles/tokens.css`.
Identidad y criterios de marca: [`TRAZO_BRAND_GUIDELINES.md`](../TRAZO_BRAND_GUIDELINES.md).

## Paleta

| Token | HEX | Uso |
| --- | --- | --- |
| `--brand-graphite` | `#252824` | Sidebar, KPI destacada, superficies oscuras |
| `--brand-graphite-elevated` | `#323630` | Elevación sobre grafito |
| `--brand-terracotta` | `#C65D3A` | Acentos, iconos activos, series principales |
| `--brand-terracotta-hover` | `#A84B2C` | Texto pequeño y enlaces sobre fondos claros |
| `--brand-terracotta-strong` | `#B4522F` | Fondo de botones primarios |
| `--brand-terracotta-subtle` | `#F5E5DD` | Selección y estados suaves |
| `--brand-ivory` | `#F5F2EB` | Fondo general |
| `--brand-sand` | `#E7E0D5` | Bordes secundarios y superficies de apoyo |
| `--brand-olive` | `#60715A` | Éxito y series secundarias |
| `--text-primary` | `#252824` | Texto principal |
| `--text-secondary` | `#686C64` | Texto de apoyo |
| `--text-muted` | `#858A80` | Metadatos decorativos |
| `--border-subtle` | `#E8E4DC` | Divisores y bordes finos |

### Estados semánticos

| Estado | Texto | Fondo |
| --- | --- | --- |
| Success | `#4F6B47` | `#E8EDE4` |
| Warning | `#8A5714` | `#F6E9D8` |
| Danger | `#A63F32` | `#F7E3DF` |
| Info | `#4F6070` | `#E9EDF0` |

Los tokens `success`, `warning`, `danger` e `info` se exponen además como colores
Tailwind (`text-success`, `bg-success-soft`, etc.). Los estados nunca se
comunican solo con color.

### Tema oscuro — Trazo Nocturno

Bloque `.dark` de `tokens.css`. Nunca negro puro ni azul de dashboard genérico.

| Token | HEX | Uso |
| --- | --- | --- |
| `--canvas` | `#191C19` | Fondo principal |
| `--surface` | `#30352F` | Tarjetas y formularios |
| `--sidebar` | `#252A25` | Sidebar flotante |
| `--brand-graphite-elevated` | `#383E37` | Superficie elevada / popovers |
| `--brand-terracotta` | `#E18A69` | Acento y acciones |
| `--brand-terracotta-hover` | `#F0A88B` | Enlaces y texto pequeño |
| `--text-primary` | `#F0EAE0` | Texto principal |
| `--text-secondary` | `#B2B8AE` | Texto de apoyo |
| `--border-subtle` | `#454B43` | Bordes y divisores |
| `--chart-muted` | `#5B6158` | Serie comparativa de presupuesto |

- Botones primarios: `--primary: #E18A69` con `--primary-foreground: #191C19`
  (texto grafito sobre terracota luminosa, AA).
- Semánticos oscuros: success `#A9C59A` / `#293827`, warning `#E8B77A` /
  `#4A3B22`, danger `#F0A79B` / `#4A2B27`, info `#A8BCCB` / `#26333C`.
- `color-scheme: dark` y sombras más contenidas.
- Los pares críticos de ambos temas están protegidos por
  `src/tests/trazo-brand.test.ts` (lectura separada de `:root` y `.dark`).

## Tipografía

- **Encabezados:** Manrope Variable (`@fontsource-variable/manrope`).
- **Interfaz y cifras:** Inter Variable con `tabular-nums`.
- Escala: 12 · 13 · 14 · 15 · 16 · 18 · 20 · 24 · 30 · 32 px.
- Títulos: 600–700; cuerpo: 400–500; etiquetas KPI: 11 px en versalitas.

## Espaciado, radios y sombras

- Espaciado en múltiplos de 4 px (4 / 8 / 12 / 16 / 24 / 32).
- Radios: 8–12 px controles, 18 px tarjetas, 20 px paneles flotantes.
- `--shadow-card` y `--shadow-raised`: sombras discretas, nunca pesadas.
- Sin gradientes llamativos; el degradado radial terracota de la sidebar es
  sutil y decorativo.

## Layout

| Breakpoint | Navegación | Contenido |
| --- | --- | --- |
| < 768 px | Drawer lateral con cierre, Escape, foco y scroll bloqueado | 1 columna |
| 768–1279 px | Sidebar visible; compacta por defecto, expandible | KPIs 2 columnas |
| ≥ 1280 px | Sidebar expandible de 248 px; expandida por defecto | KPIs 4 columnas |

- Sidebar flotante de altura completa: `top/bottom: 16 px` → `calc(100dvh - 32px)`,
  12 px del borde izquierdo, radio 22 px, grafito y sombra suave.
- Ancho: 248 px expandida / 76 px compacta; la transición de 200 ms solo cambia
  el ancho. Flexbox mantiene el pie anclado y el scroll solo en la navegación.
- Topbar flotante: superficie, radio 20 px, borde arena.
- Contenido máximo 1600 px, padding 12–24 px; `overflow-x-clip` evita scroll
  horizontal accidental.
- Sin logo, isotipo, wordmark ni subtítulo dentro de la sidebar: la cabecera se
  dedica al perfil.

## Componentes clave

- `KpiCard`: tarjeta blanca; la primera puede usar grafito como ancla visual.
  Etiqueta en versalitas, valor 32 px tabular, delta contextual y enlace.
- `Button`: primario terracota accesible; outline con borde arena; ghost.
- `Card` / `SectionCard` / `ChartCard`: radio 18 px, borde sutil y sombra discreta.
- `StatusBadge` / `PriorityBadge`: icono o punto + texto + color.
- `MetricDelta`: variación con icono, signo y color semántico.
- `ProgressBar`: `role="progressbar"`, oliva al 100 % y terracota en curso.
- `EmptyState`, `ErrorState`, `Skeleton`: estados honestos y accesibles.
- `DemoBadge`: rotulación permanente de entorno simulado.
- `LogoMark`: recurso de marca para superficies fuera de la navegación; no se
  usa dentro de la sidebar ni del drawer.
- `SidebarProfile`: avatar, saludo dinámico y nombre del perfil demo.
- `AppearanceControl`: selector Claro / Oscuro / Sistema.

## Navegación flotante

### Estructura

1. **Cabecera:** avatar, saludo dinámico, nombre y botón expandir/contraer.
2. Divisor sutil + título `MENÚ`.
3. **Módulos:** Resumen general, Proyectos, Monitor de cambios, Centro de
   alertas y Actividad. Scroll interno solo en esta zona.
4. **Pie anclado:** Apariencia y Configuración demo.

Sin logo, wordmark, subtítulo ni aviso de entorno demo dentro de la sidebar.

### Expandido y compacto

- Expandida 248 px; compacta 76 px; transición de 200 ms que solo altera el
  ancho. Altura `calc(100dvh - 32px)` con `top/bottom: 16 px`.
- Preferencia en `localStorage` (`trazo:nav-collapsed`). Por defecto expandida
  en ≥ 1280 px y compacta por debajo.
- Estado activo: fondo sutil, rail terracota, icono terracota y texto marfil.
- Compacta: iconos centrados, tooltips accesibles y `aria-label`; el avatar
  expande la navegación.

### Submenús

- Proyectos: Todos los proyectos (`/projects`), En ejecución
  (`/projects?estado=in_progress`), Archivados
  (`/projects?archivados=solo`).
- Monitor de cambios: Cambios recientes (`/monitor`), Historial de versiones
  (`/activity?accion=version.created`).
- Centro de alertas: Alertas abiertas (`/alerts?estado=open`) y Alertas
  revisadas (`/alerts?estado=reviewed`).
- Expandido: rama debajo del módulo con línea vertical, conector y chevron;
  `aria-expanded` + `aria-controls`; el grupo del módulo activo abre por defecto.
- Compacto: popover lateral alineado al icono, cierre con Escape, selección con
  teclado y retorno de foco al disparador.
- Cada hijo del menú apunta a una ruta real; no hay entradas deshabilitadas.

### Saludo

- Una única utilidad (`lib/greeting.ts`) define las franjas locales:
  05:00–11:59 mañana, 12:00–18:59 tarde, 19:00–04:59 noche.
- Sidebar: saludo tradicional («Buenos días», «Buenas tardes», «Buenas noches»)
  junto al nombre del perfil demo.
- Dashboard: tres alternativas por franja. La elegida se deriva de una semilla
  pseudoaleatoria guardada en `sessionStorage` (`trazo:greeting-seed`), por lo
  que no cambia en cada render ni al navegar entre módulos; solo puede cambiar
  al cruzar de franja horaria.
- Ambos saludos se reprograman en los límites 05:00, 12:00 y 19:00 sin recargar.
  El nombre sale de `DEMO_CURRENT_USER`, nunca está escrito a mano.

### Apariencia

- Preferencia `light | dark | system` en `localStorage` (`trazo:theme`).
- Script inline en `index.html` aplica `.dark` antes del primer render para
  evitar flash; el `ThemeProvider` sincroniza `prefers-color-scheme`, el evento
  `storage` y `meta[name="theme-color"]`.
- Expandido: control segmentado con `aria-pressed`. Compacto: icono Sol / Luna /
  Monitor con tooltip y menú de radios accesible.

### Móvil

- Drawer lateral de 300 px (`max-w-[85vw]`) reutilizando el mismo contenido.
- Base UI Dialog gestiona foco, Escape y bloqueo de scroll; se añaden áreas
  seguras y el drawer se cierra al navegar.

### Topbar

- Breadcrumb `trazo.`, sección, indicador demo, alertas y perfil.

## Accesibilidad

- Objetivo WCAG 2.2 AA.
- Skip-link, `aria-current`, foco visible y orden lógico.
- Contraste mínimo 4.5:1 en texto normal en ambos temas, verificado por
  `src/tests/trazo-brand.test.ts`.
- Estados con icono y texto; gráficos con leyenda y resumen `sr-only`.
- `prefers-reduced-motion` desactiva animaciones.
- Tooltips, popovers y menús accesibles mediante Base UI.
- Navegación por teclado en submenús, cambio de apariencia y drawer; foco visible
  y retorno al disparador al cerrar.

## Verificación

```bash
npm run lint
npm run typecheck
NODE_ENV=test npm run test
npm run build
```
