# Módulos del backend (Fase 5)

Cada módulo expone las rutas de `/api/v1` y delega en repositorios Prisma y
servicios de dominio puros:

```text
routes/controllers  →  services (dominio)  →  repositories  →  Prisma
```

| Módulo      | Endpoints                                                                                                                |
| ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| `dashboard` | `GET /api/v1/dashboard/summary`                                                                                          |
| `projects`  | `GET/POST /api/v1/projects`, `GET/PATCH /api/v1/projects/:id`, `POST .../archive`, `GET .../versions`, `GET .../changes` |
| `versions`  | `GET /api/v1/versions`, `GET /api/v1/versions/:id`                                                                       |
| `changes`   | `GET /api/v1/changes`                                                                                                    |
| `alerts`    | `GET /api/v1/alerts`, `GET /api/v1/alerts/count-open`, `GET /:id`, `PATCH /:id/status`                                   |
| `activity`  | `GET /api/v1/activity`                                                                                                   |
| `rules`     | `GET /api/v1/rules`, `PATCH /api/v1/rules/:id`                                                                           |
| `users`     | `GET /api/v1/users`                                                                                                      |
| `demo`      | `POST /api/v1/demo/reset`, `POST /api/v1/demo/scenarios/:id/run` (solo demo)                                             |

Los escenarios (`budget-increase`, `deadline-postponed`, `project-on-hold` y
`priority-critical`) se aplican en el servidor sobre `POST
/demo/scenarios/:id/run` con `{ "projectId": "<uuid>" }`, registrando la versión
con origen `simulated`, los cambios y las alertas derivadas de las reglas.
