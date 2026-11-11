# Módulos del backend (Fase 5)

El esqueleto solo expone `GET /api/v1/health`. Los módulos de negocio se
incorporan en las siguientes tareas de la Fase 5 y la Fase 6, respetando el
mismo orden de capas que el frontend:

```text
routes/controllers  →  services (dominio)  →  repositories  →  Prisma
```

Módulos previstos, alineados con los contratos de `frontend/src/data/contracts`:

| Módulo      | Endpoints planeados                                                               |
| ----------- | --------------------------------------------------------------------------------- |
| `dashboard` | `GET /api/v1/dashboard/summary`                                                   |
| `projects`  | `GET/POST /api/v1/projects`, `GET/PATCH /api/v1/projects/:id`, `POST .../archive` |
| `versions`  | `GET /api/v1/projects/:id/versions`                                               |
| `changes`   | `GET /api/v1/projects/:id/changes`                                                |
| `alerts`    | `GET /api/v1/alerts`, `PATCH /api/v1/alerts/:id/status`                           |
| `activity`  | `GET /api/v1/activity`                                                            |
| `demo`      | `POST /api/v1/demo/reset`, `POST /api/v1/demo/scenarios/:id/run` (solo demo)      |

Cada módulo se creará únicamente cuando tenga lógica real; no se publican rutas
que respondan datos simulados desde el servidor.
