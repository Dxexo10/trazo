import type { RuleConfigRepository } from '@/data/contracts'
import type { RuleConfig } from '@/domain/models'
import { apiGet, apiRequest } from './client'

export class HttpRuleConfigRepository implements RuleConfigRepository {
  async list(): Promise<RuleConfig[]> {
    return apiGet<RuleConfig[]>('/rules')
  }

  async update(
    id: string,
    patch: Partial<Omit<RuleConfig, 'id' | 'ruleKey'>>,
  ): Promise<RuleConfig> {
    const body: Record<string, unknown> = {}

    if (patch.enabled !== undefined) body.enabled = patch.enabled
    if (patch.threshold !== undefined) body.threshold = patch.threshold
    if (patch.severity !== undefined) body.severity = patch.severity

    return apiRequest<RuleConfig>(`/rules/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body,
    })
  }
}
