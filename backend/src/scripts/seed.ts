import { seedDatabase } from '../data/services/seed-database.js'
import { prisma } from '../lib/prisma.js'

try {
  const result = await seedDatabase()
  console.info('[trazo-api] dataset sembrado', result)
} catch (error) {
  console.error('[trazo-api] error al sembrar el dataset', error)
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}
