import { DEFAULT_RULE_CONFIGS, type RuleConfig } from '../models/index.js'

export function generateRuleConfigs(): RuleConfig[] {
  return DEFAULT_RULE_CONFIGS.map((config) => ({ ...config }))
}
