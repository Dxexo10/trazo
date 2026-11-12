const MIN_LATENCY_MS = 120
const MAX_LATENCY_MS = 320

export async function withLatency<T>(value: T): Promise<T> {
  const shouldSimulate = import.meta.env.DEV && import.meta.env.MODE !== 'test'

  if (shouldSimulate) {
    const delay =
      MIN_LATENCY_MS + Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS)
    await new Promise((resolve) => setTimeout(resolve, delay))
  }

  return value
}
