# Adaptadores HTTP (Fase 7)

Implementan los contratos de `src/data/contracts` contra la API REST
`/api/v1` del backend. `src/data/index.ts` elige automáticamente entre estos
adaptadores y los mocks de `src/data/mock` según el entorno.

## Activar la API real

1. Copia `frontend/.env.example` a `frontend/.env`.
2. Define `VITE_API_BASE_URL=http://localhost:4000/api/v1` (o la URL del backend).
3. Arranca el backend (`backend/`: `npm run dev`) con SQL Server accesible.

Sin `VITE_API_BASE_URL` la aplicación usa IndexedDB y no necesita backend. En
modo test (`import.meta.env.MODE === 'test'`) siempre se usan los mocks para que
las pruebas unitarias no dependan de la red.

## Ficheros

- `client.ts`: `fetch` tipado, serialización de query (arrays como CSV, que el
  backend acepta), manejo de `204`, `ApiError` con el `error.message` del
  backend, `apiGetAllPages` (recorre páginas de 100) y `apiList` (traduce
  `page`/`pageSize`, agregando páginas si el contrato pide más de 100 filas).
- `http-*-repository.ts`: un adaptador por contrato.
- `reset.ts`: `resetDemoData()` → `POST /demo/reset`.
- `http-user-repository.ts`: `GET /users`.

## Diferencias conocidas con el mock

- El backend fija `actorId` y `source` en el servidor: las escrituras se
  registran como `manual` aunque la simulación use `source: 'simulated'`.
- Los ids de proyecto/servidor son UUID, no `prj_####`.
- Los usuarios (responsables, filtros y autores) se leen de `GET /users`. El
  perfil de topbar/sidebar mantiene la identidad demo porque la API aún no tiene
  autenticación.
- `POST /demo/scenarios/:id/run` ya existe en el backend (aplica el escenario con
  origen `simulated`); falta que `use-simulate-update` llame a ese endpoint en
  modo HTTP en lugar de usar `PATCH /projects/:id`.
