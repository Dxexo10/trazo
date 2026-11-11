export function createRandom(seed: number): () => number {
  let state = seed >>> 0

  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296
  }
}

export function pick<T>(random: () => number, items: readonly T[]): T {
  const index = Math.floor(random() * items.length)
  const item = items[index]
  if (item === undefined) {
    throw new Error('No se puede elegir un elemento de una lista vacía.')
  }
  return item
}

export function randomInt(
  random: () => number,
  min: number,
  max: number,
): number {
  return Math.floor(random() * (max - min + 1)) + min
}

export function randomBetween(
  random: () => number,
  min: number,
  max: number,
): number {
  return random() * (max - min) + min
}

export function pickMany<T>(
  random: () => number,
  items: readonly T[],
  count: number,
): T[] {
  const pool = [...items]
  const selection: T[] = []
  const total = Math.min(count, pool.length)

  for (let index = 0; index < total; index += 1) {
    const [item] = pool.splice(Math.floor(random() * pool.length), 1)
    if (item !== undefined) selection.push(item)
  }

  return selection
}

export function stableId(namespace: number, index: number): string {
  return `${namespace.toString(16).padStart(8, '0')}-0000-4000-8000-${index
    .toString(16)
    .padStart(12, '0')}`
}
