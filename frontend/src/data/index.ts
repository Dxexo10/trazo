import { isHttpBackendEnabled } from '@/lib/api-config'
import type {
  ActivityRepository,
  AlertRepository,
  ChangeEventRepository,
  ProjectRepository,
  RuleConfigRepository,
  UserRepository,
  VersionRepository,
} from './contracts'
import { HttpActivityRepository } from './http/http-activity-repository'
import { HttpAlertRepository } from './http/http-alert-repository'
import { HttpChangeEventRepository } from './http/http-change-repository'
import { HttpProjectRepository } from './http/http-project-repository'
import { HttpRuleConfigRepository } from './http/http-rule-config-repository'
import { HttpUserRepository } from './http/http-user-repository'
import { HttpVersionRepository } from './http/http-version-repository'
import { resetDemoData as resetHttpDemoData } from './http/reset'
import { MockActivityRepository } from './mock/adapters/mock-activity-repository'
import { MockAlertRepository } from './mock/adapters/mock-alert-repository'
import { MockChangeEventRepository } from './mock/adapters/mock-change-repository'
import { MockProjectRepository } from './mock/adapters/mock-project-repository'
import { MockRuleConfigRepository } from './mock/adapters/mock-rule-config-repository'
import { MockUserRepository } from './mock/adapters/mock-user-repository'
import { MockVersionRepository } from './mock/adapters/mock-version-repository'
import { resetDemoData as resetMockDemoData } from './mock/storage/db'

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

export const changeEventRepository: ChangeEventRepository =
  isHttpBackendEnabled
    ? new HttpChangeEventRepository()
    : new MockChangeEventRepository()

export const ruleConfigRepository: RuleConfigRepository =
  isHttpBackendEnabled
    ? new HttpRuleConfigRepository()
    : new MockRuleConfigRepository()

export const userRepository: UserRepository = isHttpBackendEnabled
  ? new HttpUserRepository()
  : new MockUserRepository()

/** Restablece el dataset demo: SQL Server si hay API, IndexedDB si no. */
export const resetDemoData = isHttpBackendEnabled
  ? resetHttpDemoData
  : resetMockDemoData

export { isHttpBackendEnabled }
export * from './contracts'
