import type { User } from '@/domain/models'

export interface UserRepository {
  list(): Promise<User[]>
}
