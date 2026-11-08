# Trazo — Guía de marca y sistema visual

> **Estado:** identidad vigente desde el rebranding de ProyTrack.
> **Prioridad:** esta guía prevalece sobre las decisiones visuales anteriores.
> Las especificaciones funcionales de `PROYTRACK_MASTER_SPEC.md` siguen vigentes.

## 1. Marca

- **Nombre:** Trazo
- **Wordmark opcional:** trazo.
- **Nombre descriptivo:** Trazo — Gestión inteligente de proyectos
- **Descriptor técnico:** Project Management & Intelligence
- **Mensaje principal:** Cada proyecto tiene un camino.
- **Mensajes secundarios:**
  - Tus proyectos, bajo una nueva perspectiva.
  - Cada avance cuenta.
  - Claridad para decidir. Control para avanzar.
  - Gestiona el presente. Visualiza lo que viene.

### Esencia

Trazo representa claridad, dirección, seguimiento y evolución. Cada proyecto
tiene un camino; Trazo permite visualizarlo, comprender sus cambios y decidir
mejor.

### Personalidad

Profesional pero cercana, moderna sin ser plantilla, elegante sin ostentación,
tecnológica sin futurismo, confiable, clara y minimalista con identidad propia.

### Tono de voz

Español natural para usuarios empresariales de Perú y Latinoamérica. Directo,
orientado a decisiones y sin anglicismos innecesarios.

## 2. Paleta

### Colores de marca

| Token | HEX | Uso |
| --- | --- | --- |
| `--brand-graphite` | `#252824` | Sidebar, superficies oscuras, KPI destacada |
| `--brand-graphite-elevated` | `#323630` | Elevación y hover sobre grafito |
| `--brand-terracotta` | `#C65D3A` | Acentos, iconos activos, series principales |
| `--brand-terracotta-hover` | `#A84B2C` | Texto pequeño y enlaces sobre fondos claros |
| `--brand-terracotta-strong` | `#B4522F` | Fondo de botones primarios con texto blanco |
| `--brand-terracotta-subtle` | `#F5E5DD` | Selección y estados suaves |
| `--brand-ivory` | `#F5F2EB` | Fondo general |
| `--brand-sand` | `#E7E0D5` | Bordes secundarios y superficies de apoyo |
| `--brand-olive` | `#60715A` | Éxito y series secundarias |

### Neutros y superficies

| Token | HEX | Uso |
| --- | --- | --- |
| White | `#FFFFFF` | Tarjetas y topbar |
| Text primary | `#252824` | Texto principal |
| Text secondary | `#686C64` | Texto de apoyo |
| Text muted | `#858A80` | Metadatos |
| Border subtle | `#E8E4DC` | Divisores y bordes finos |

### Estados semánticos

| Estado | Texto | Fondo suave |
| --- | --- | --- |
| Success | `#4F6B47` | `#E8EDE4` |
| Warning | `#8A5714` | `#F6E9D8` |
| Danger | `#A63F32` | `#F7E3DF` |
| Info | `#4F6070` | `#E9EDF0` |

Los estados siempre combinan **icono + texto + color**. El terracota no
representa estados semánticos.

### Contraste

- `#C65D3A` sobre blanco no alcanza 4.5:1 para texto normal: se usa `#A84B2C`
  para enlaces y texto pequeño.
- Los botones primarios usan `#B4522F` para garantizar AA con texto blanco.
- `#C65D3A` se reserva para iconos, indicadores, bordes y elementos grandes.
- El test `src/tests/tokens-contrast.test.ts` protege los pares críticos.

## 3. Tipografía

- **Encabezados:** Manrope Variable (`@fontsource-variable/manrope`).
- **Interfaz y cifras:** Inter Variable con `tabular-nums`.
- **Fallback:** Inter a peso 650/700 si Manrope no carga.

| Nivel | Tamaño | Peso |
| --- | --- | --- |
| Título principal | 30–32 px | 650–700 |
| Título de sección | 20–24 px | 600–650 |
| Título de tarjeta | 15–16 px | 600 |
| Cuerpo | 14–15 px | 400–500 |
| Secundario | 12–13 px | 400–500 |

No se reduce el tamaño para meter más contenido. Tablas y gráficos priorizan
legibilidad.

## 4. Logotipo

- Símbolo: un trazo continuo ascendente que termina en un nodo.
- Wordmark: `trazo.` en Manrope semibold con punto terracota.
- Fondo del símbolo: grafito redondeado; trazo terracota.
- Uso mínimo: 28 px de alto. No deformar, rotar ni recolorear fuera de la
  paleta. Sobre fondos claros, el símbolo puede ser grafito + terracota.

## 5. Floating Workspace

- Sidebar flotante de altura completa: `top/bottom: 16 px` →
  `calc(100dvh - 32px)`, 12 px del borde izquierdo, radio 22 px, fondo grafito y
  sombra suave. Posición fixed; nunca `height: fit-content`.
- Compacta: 76 px. Expandida: 248 px. Transición de 200 ms que solo cambia el
  ancho. Flexbox ancla el pie y el scroll queda solo en la navegación.
- Cabecera dedicada al usuario: avatar, saludo dinámico y nombre. Sin logo,
  isotipo, wordmark ni subtítulo dentro de la sidebar/drawer.
- Módulos arriba; Apariencia y Configuración ancladas abajo. Sin bloques
  decorativos ni aviso demo dentro de la navegación.
- Submenús jerárquicos con línea vertical sutil en expandido y popover lateral
  en compacto. Cada entrada enlaza a una ruta real.
- Activo: rail terracota, icono terracota, texto marfil y fondo blanco al 6 %.
- Topbar flotante independiente, radio 20 px, borde sand, sombra muy sutil.
- Contenido máximo 1600 px, padding 16–32 px según breakpoint.
- Sin scroll horizontal en ningún breakpoint.

### Responsive

| Breakpoint | Navegación | Contenido |
| --- | --- | --- |
| < 768 px | Drawer con cierre, Escape, foco y scroll bloqueado | 1 columna |
| 768–1279 px | Sidebar compacta por defecto, expandible | KPIs 2 columnas |
| ≥ 1280 px | Sidebar expandida por defecto | KPIs 4 columnas |

### Movimiento

Transiciones de 180–250 ms en hover, apertura de sidebar, filtros, carga y
feedback. Sin animaciones constantes, neón, glassmorphism excesivo ni sombras
intensas. `prefers-reduced-motion` desactiva el movimiento.

## 5.1 Trazo Nocturno

Modo oscuro propio, cálido y no genérico: fondo `#191C19`, sidebar `#252A25`,
tarjetas `#30352F`, terracota luminosa `#E18A69`, texto `#F0EAE0`, secundario
`#B2B8AE` y bordes `#454B43`. Nada de negro puro ni azul oscuro de dashboard.

El selector Claro / Oscuro / Sistema vive en el pie de la sidebar. La preferencia
se guarda en `localStorage` (`trazo:theme`), respeta `prefers-color-scheme` y se
aplica antes del primer render para evitar flash. Todos los pares críticos deben
cumplir WCAG AA en ambos temas.

## 6. Componentes

- **KPI Card:** superficie blanca, radio 18 px, etiqueta legible, valor grande
  tabular, icono sobrio, variación contextual. La tarjeta “Total de proyectos”
  puede usar superficie grafito como ancla visual.
- **Button:** primario terracota accesible, secundario blanco con borde sand,
  ghost sobre ivory. Foco visible siempre.
- **Card:** radio 18 px, borde sutil y sombra discreta; sin gradientes.
- **Badges:** fondo suave + texto accesible + icono cuando aporte significado.
- **Table:** encabezado en versalitas suaves, separadores sand, hover ivory,
  espaciado cómodo y scroll horizontal controlado.
- **Charts:** series terracota, oliva y ámbar; grid sand; tooltips blancos con
  borde sand; resumen textual `sr-only` y leyenda visible.
- **Actividad:** línea de tiempo con hitos diferenciados por tipo de evento.
- **Empty/Error/Loading:** estados honestos, con reintento cuando aplique.

## 7. Accesibilidad

- Objetivo WCAG 2.2 AA.
- Navegación por teclado, foco visible y orden lógico.
- Contraste mínimo 4.5:1 en texto normal.
- Estados que no dependen solo del color.
- `aria-current`, tooltips accesibles y botones con nombre.
- Resúmenes textuales en gráficos y respeto a `prefers-reduced-motion`.
- Drawer móvil cerrable con Escape sin bloquear el contenido principal.

## 8. Uso

**Sí:** superficies cálidas, jerarquía editorial, acentos terracota puntuales,
espaciado generoso, iconos Lucide consistentes.

**No:** azul eléctrico como color de marca, degradados llamativos, glassmorphism,
sombras pesadas, bloques de color plano sin contraste, textos genéricos de
plantilla.
