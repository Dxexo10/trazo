import type {
  ActivityLog,
  Alert,
  ChangeEvent,
  Project,
  ProjectVersion,
  RuleConfig,
  User,
} from '../models/index.js'
import { DEMO_SEED } from '../../lib/demo-config.js'
import { generateActivity } from './activity.js'
import { generateAlerts } from './alerts.js'
import { generateProjects } from './projects.js'
import { createRandom } from './random.js'
import { generateRuleConfigs } from './rules.js'
import { DEMO_USERS } from './users.js'
import { generateVersions } from './versions.js'

export interface DemoDataset {
  users: readonly User[]
  projects: Project[]
  versions: ProjectVersion[]
  changes: ChangeEvent[]
  alerts: Alert[]
  activity: ActivityLog[]
  rules: RuleConfig[]
}

export function generateDemoDataset(): DemoDataset {
  const random = createRandom(DEMO_SEED)
  const projects = generateProjects(random)
  const { versions, changes } = generateVersions(random, projects)
  const rules = generateRuleConfigs()
  const alerts = generateAlerts(versions, rules)
  const activity = generateActivity(random, projects, alerts, versions)

  return {
    users: DEMO_USERS,
    projects,
    versions,
    changes,
    alerts,
    activity,
    rules,
  }
}
