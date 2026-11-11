import type { UserRepository } from '@/data/contracts'
import type { User } from '@/domain/models'
import { apiGet } from './client'

export class HttpUserRepository implements UserRepository {
  async list(): Promise<User[]> {
    return apiGet<User[]>('/users')
  }
}
