import { createServer } from 'node:http'
import { app } from './app.js'
import { env } from './config/env.js'

const server = createServer(app)

server.listen(env.port, () => {
  console.info(
    `[trazo-api] escuchando en http://localhost:${env.port} (${env.nodeEnv})`,
  )
})

function shutdown(signal: NodeJS.Signals): void {
  console.info(`[trazo-api] ${signal} recibido, cerrando el servidor`)

  server.close((error) => {
    if (error) {
      console.error('[trazo-api] error al cerrar el servidor', error)
      process.exit(1)
    }

    process.exit(0)
  })

  setTimeout(() => {
    console.error('[trazo-api] cierre forzado tras 10 s')
    process.exit(1)
  }, 10_000).unref()
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => shutdown(signal))
}
