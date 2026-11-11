import type { RuleUpdateInput } from '../../domain/schemas/index.js'
import type { RuleConfig } from '../../domain/models/index.js'
import { NotFoundError } from '../../lib/errors.js'
import { prisma } from '../../lib/prisma.js'
import { toRuleConfig } from '../mappers.js'

export const ruleConfigRepository = {
  async list(): Promise<RuleConfig[]> {
    const records = await prisma.ruleConfig.findMany({
      orderBy: { ruleKey: 'asc' },
    })
    return records.map(toRuleConfig)
  },

  async update(id: string, patch: RuleUpdateInput): Promise<RuleConfig> {
    const existing = await prisma.ruleConfig.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError('La regla solicitada no existe.')

    const record = await prisma.ruleConfig.update({
      where: { id },
      data: {
        ...(patch.enabled !== undefined ? { enabled: patch.enabled } : {}),
        ...(patch.threshold !== undefined
          ? { threshold: patch.threshold }
          : {}),
        ...(patch.severity !== undefined ? { severity: patch.severity } : {}),
      },
    })

    return toRuleConfig(record)
  },
}
