# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Usuario primario:** gerente de proyectos / PMO que supervisa un portafolio empresarial y necesita decidir dónde intervenir: desviaciones presupuestales, retrasos, bloqueos y alertas abiertas.

**Audiencias secundarias confirmadas:** líder de equipo (seguimiento de proyectos asignados), analista (historial, comparaciones y tendencias) y visitante o reclutador que explora la demo sin registro.

## Product Purpose

Trazo centraliza la gestión de proyectos empresariales —portafolio, presupuestos, avance, fechas y responsables— y convierte los cambios relevantes en alertas explicables e indicadores ejecutivos.

La demo existe para que una persona que nunca vio el producto entienda el estado del portafolio, abra y edite un proyecto, observe la detección de un cambio, revise la alerta y consulte el historial, todo sin backend real. El éxito se mide por esa secuencia comprensible de extremo a extremo con datos simulados coherentes.

## Positioning

No se limita a mostrar el estado actual: conserva versiones de cada proyecto y explica qué cambió, cuándo, quién lo hizo y qué regla disparó cada alerta. Un dashboard de portafolio vecino podría copiar los KPIs, pero no la trazabilidad explicable de los cambios.

## Operating Context

- Aplicación web frontend-first en React + TypeScript; el backend, la autenticación y SQL Server llegan en fases posteriores.
- Dataset determinista de 50 proyectos de tecnología, construcción y consultoría, con semilla fija y fecha de referencia `2026-10-31`; se persiste en IndexedDB y sobrevive a la recarga.
- La etiqueta “Entorno de demostración · Datos simulados” es permanente y visible en toda la aplicación.
- El trabajo avanza por fases: F1 dashboard y fundamentos; F2 proyectos; F3 versiones y alertas; F4 QA; F5–F7 backend.
- Los módulos aún no implementados muestran su alcance y fase; no se simula funcionalidad inexistente.

## Capabilities and Constraints

- **Disponible (F1):** dashboard ejecutivo con KPIs, gráficos, tabla de atención, actividad reciente, filtro de periodo en URL y navegación responsive.
- **Planificado:** CRUD de proyectos con archivado lógico, versiones inmutables, comparador antes/después, motor de reglas y alertas, historial, configuración y reset demo.
- Los KPIs, gráficos, tablas y alertas se calculan desde el mismo estado; no se escriben cifras a mano.
- Dinero en céntimos enteros y moneda PEN; fechas ISO-8601 UTC; interfaz en español y nombres de código en inglés.
- Sin IA generativa, pagos, integraciones externas ni multiempresa real mientras no se apruebe.
- No iniciar backend, autenticación ni SQL Server sin autorización explícita del propietario.
- **Decisiones abiertas:** dominio definitivo y disponibilidad de marca, identidad gráfica final (wordmark/logo definitivos), hosting, autenticación y multiempresa reales, formato de exportación de reportes.

## Brand Commitments

- Nombre: **Trazo**. Wordmark opcional: **trazo.** Descriptor: **Project Management & Intelligence**. Eslogan: **Cada proyecto tiene un camino.**
- Personalidad confirmada: profesional pero cercana, moderna sin plantilla, elegante sin ostentación, tecnológica sin futurismo, confiable, clara y minimalista con identidad propia. Tono directo orientado a decisiones, sin anglicismos innecesarios.
- La identidad visual vinculante (terracota, grafito, marfil, arena y oliva; Manrope + Inter; Floating Workspace) se define en `TRAZO_BRAND_GUIDELINES.md`.
- Restricción visual vinculante del propietario: **tono claro (light mode)**.
- El wordmark y el logotipo actual son provisionales; no inventar clientes, testimonios ni resultados de negocio.
- El repositorio remoto es `Dxexo10/trazo`; la URL anterior de GitHub redirige al nuevo nombre.

## Evidence on Hand

- `PROYTRACK_MASTER_SPEC.md`: alcance, módulos, reglas y roadmap.
- `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, `docs/DESIGN_SYSTEM.md`, `docs/IMPLEMENTATION_STATUS.md`: arquitectura, ADRs, tokens y estado real.
- Dataset determinista y utilidades en `frontend/src/data/mock` y `frontend/src/domain`.
- Un perfil demo fijo (`DEMO_CURRENT_USER`); no existe autenticación real.
- **Ausencias que futuras iteraciones no deben fabricar:** capturas reales, testimonios, clientes, precios, métricas de negocio, certificaciones o despliegue público.

## Product Principles

1. **Explicar, no solo mostrar.** Todo cambio relevante debe poder rastrearse a una versión, un valor anterior y nuevo, y una regla.
2. **Una sola verdad.** KPIs, gráficos, tablas y alertas se derivan del mismo estado; nunca de valores hardcodeados.
3. **Demo honesta.** Datos simulados rotulados, funciones reales y alcance pendiente declarado.
4. **Producto antes que decoración.** La interfaz premium debe servir a decisiones y no ocultar carencias funcionales.
5. **Frontend-first desacoplado.** La capa de datos se sustituye por una API REST sin reescribir vistas ni dominio.

## Accessibility & Inclusion

Objetivo WCAG 2.2 AA: navegación por teclado, foco visible, etiquetas y errores asociados, contraste mínimo 4.5:1, estados que no dependen solo del color, resúmenes textuales de gráficos y respeto a `prefers-reduced-motion`.
