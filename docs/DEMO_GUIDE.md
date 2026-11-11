# Guía de demo — Trazo

Guion corto para recorrer el producto sin backend, usando el dataset determinista
de 50 proyectos y un reloj de referencia fijo (`31 oct 2026`).

## Requisitos y arranque

```bash
cd frontend
npm ci --include=dev
npm run dev
```

Abre `http://localhost:5173`. La primera carga siembra IndexedDB. No hay login:
el perfil demo es fijo y no representa seguridad real.

## Guion de 5 minutos

### 1. Dashboard — 40 s

1. Abre `/dashboard`.
2. Revisa los cuatro KPIs y los tres gráficos.
3. Cambia el periodo (3 / 6 / 12 meses): la serie y los deltas se recalculan; los
   totales siguen representando el portafolio activo completo.

### 2. Portafolio — 40 s

1. Entra a `/projects`.
2. Busca `ERP`, filtra por estado o abre “Más filtros” para responsable/riesgo.
3. Comprueba que los filtros quedan en la URL y que la paginación se mantiene.
4. Abre `PRJ-001 · Implementación de ERP corporativo`.

### 3. Flujo estrella: versión + alerta — 90 s

1. En el detalle, pulsa **Editar**.
2. Escribe un motivo, por ejemplo “Ajuste aprobado por el cliente”.
3. Cambia **Presupuesto actual** de `4200000` a `5040000` (+20 % exacto).
4. Guarda. Verás el toast de nueva versión y la alerta de advertencia
   (`>10 %`), porque la regla crítica exige estrictamente `>20 %`.
5. En **Historial** aparece la versión 5 con autor, fecha, motivo, cambios y
   reglas disparadas.
6. En **Comparar versiones** elige dos instantáneas y revisa el antes/después.

### 4. Monitor y simulador — 60 s

1. Entra a `/monitor`.
2. Filtra por `PRJ-001`, campo “Presupuesto” o severidad.
3. Abre un cambio: verás actor, origen, antes/después, motivo y reglas.
4. Pulsa **Simular actualización** (solo demo), elige `PRJ-001` y el escenario
   “Incremento de presupuesto (+15 %)”. Se crea otra versión con alerta.
5. Los escenarios disponibles son: presupuesto +15 %, entrega +30 días,
   proyecto bloqueado y prioridad crítica.

### 5. Alertas — 60 s

1. Entra a `/alerts`.
2. Revisa los contadores: abiertas, críticas, revisadas y resueltas.
3. Filtra por severidad o proyecto.
4. Pulsa **Revisar** o **Resolver**. El estado y la actividad se actualizan, y
   la campana del topbar refleja el nuevo conteo.

### 6. Actividad y configuración — 50 s

1. En `/activity`, filtra por usuario, acción, origen o periodo.
2. En `/settings` revisa el perfil demo, la semilla 3 / esquema 2 y la fecha de
   referencia.
3. Ajusta un umbral (por ejemplo, advertencia de presupuesto a 5 %) y guarda.
   Aplica a las versiones futuras, no al historial.
4. Pulsa **Restablecer datos** y confirma: el portafolio vuelve al dataset
   inicial.

## Reglas demo

| Regla                  | Disparador                    | Severidad   |
| ---------------------- | ----------------------------- | ----------- |
| Presupuesto desde cero | Anterior = 0 y nuevo > 0      | Crítica     |
| Incremento crítico     | Variación > 20 %              | Crítica     |
| Incremento relevante   | Variación > 10 %              | Advertencia |
| Entrega postergada     | Nueva fecha posterior         | Advertencia |
| Proyecto vencido       | Fecha pasada y avance < 100 % | Advertencia |
| Proyecto bloqueado     | Estado cambia a Bloqueado     | Crítica     |
| Prioridad crítica      | Prioridad cambia a Crítica    | Advertencia |

Sin cambios en los campos auditables no se crea versión. Una misma versión no
genera dos alertas para la misma regla.

## Verificación

```bash
npm run lint
npm run typecheck
NODE_ENV=test npm run test      # 113 pruebas
npm run test:e2e                # flujo estrella, reset, simulador, móvil y axe
npm run build
```

La E2E arranca Vite en el puerto 4173, restablece el dataset antes de cada
escenario y verifica también accesibilidad AA con axe.

## Límites

- No hay autenticación ni multiempresa; la API local es opcional.
- Los datos son ficticios y el reloj es fijo; no representa producción.
- Con la API configurada, los escenarios se ejecutan en el servidor; sin ella se
  simulan en el navegador. No hay jobs persistentes.
- La accesibilidad se audita automáticamente con axe; falta validación manual
  con lectores de pantalla.
