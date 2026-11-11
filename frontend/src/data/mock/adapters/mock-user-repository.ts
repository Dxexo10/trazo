import type { UserRepository } from '@/data/contracts'
import type { User } from '@/domain/models'
import { DEMO_USERS } from '../seed/users'
import { withLatency } from './latency'

export class MockUserRepository implements UserRepository {
  async list(): Promise<User[]> {
    return withLatency([...DEMO_USERS])
  }
}
