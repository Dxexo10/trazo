import { useQuery } from '@tanstack/react-query'
import { userRepository } from '@/data'

export const USERS_QUERY_KEY = ['users'] as const

/** Usuarios del backend (`GET /users`) o del seed demo según el entorno. */
export function useUsers() {
  return useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: () => userRepository.list(),
    staleTime: 5 * 60 * 1000,
  })
}
