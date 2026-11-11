export const USER_ROLES = ['admin', 'manager', 'analyst', 'viewer'] as const

export type UserRole = (typeof USER_ROLES)[number]

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
}
