import { isHttpBackendEnabled } from '@/lib/api-config'
import type {
  ActivityRepository,
  AlertRepository,
  ChangeEventRepository,
  DemoRepository,
  ProjectRepository,
  RuleConfigRepository,
  UserRepository,
  VersionRepository,
} from './contracts'
import { HttpActivityRepository } from './http/http-activity-repository'
import { HttpAlertRepository } from './http/http-alert-repository'
import { HttpChangeEventRepository } from './http/http-change-repository'
import { HttpDemoRepository } from './http/http-demo-repository'
import { HttpProjectRepository } from './http/http-project-repository'
import { HttpRuleConfigRepository } from './http/http-rule-config-repository'
import { HttpUserRepository } from './http/http-user-repository'
import { HttpVersionRepository } from './http/http-version-repository'
import { MockActivityRepository } from './mock/adapters/mock-activity-repository'
import { MockAlertRepository } from './mock/adapters/mock-alert-repository'
import { MockChangeEventRepository } from './mock/adapters/mock-change-repository'
import { MockDemoRepository } from './mock/adapters/mock-demo-repository'
import { MockProjectRepository } from './mock/adapters/mock-project-repository'
import { MockRuleConfigRepository } from './mock/adapters/mock-rule-config-repository'
import { MockUserRepository } from './mock/adapters/mock-user-repository'
import { MockVersionRepository } from './mock/adapters/mock-version-repository'

export const projectRepository: ProjectRepository = isHttpBackendEnabled
  ? new HttpProjectRepository()
  : new MockProjectRepository()

export const alertRepository: AlertRepository = isHttpBackendEnabled
  ? new HttpAlertRepository()
  : new MockAlertRepository()

export const activityRepository: ActivityRepository = isHttpBackendEnabled
  ? new HttpActivityRepository()
  : new MockActivityRepository()

export const versionRepository: VersionRepository = isHttpBackendEnabled
  ? new HttpVersionRepository()
  : new MockVersionRepository()

export const changeEventRepository: ChangeEventRepository = isHttpBackendEnabled
  ? new HttpChangeEventRepository()
  : new MockChangeEventRepository()

export const ruleConfigRepository: RuleConfigRepository = isHttpBackendEnabled
  ? new HttpRuleConfigRepository()
  : new MockRuleConfigRepository()

export const userRepository: UserRepository = isHttpBackendEnabled
  ? new HttpUserRepository()
  : new MockUserRepository()

export const demoRepository: DemoRepository = isHttpBackendEnabled
  ? new HttpDemoRepository()
  : new MockDemoRepository()

/** Restablece el dataset demo: SQL Server si hay API, IndexedDB si no. */
export function resetDemoData(): Promise<void> {
  return demoRepository.reset()
}

export { isHttpBackendEnabled }
export * from './contracts'
