import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { demoRepository } from '@/data'
import type { Project } from '@/domain/models'
import type { SimulationScenario } from '../scenarios'

interface SimulateUpdatePayload {
  project: Project
  scenario: SimulationScenario
}

function messageFrom(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export function useSimulateUpdate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ project, scenario }: SimulateUpdatePayload) =>
      demoRepository.runScenario(scenario, project.id),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['monitor'] })
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      void queryClient.invalidateQueries({ queryKey: ['alerts'] })
      void queryClient.invalidateQueries({ queryKey: ['activity'] })

      if (!result.changed || !result.version) {
        toast.info('La simulación no produjo cambios.', {
          description: 'El proyecto ya estaba en ese estado.',
        })
        return
      }

      toast.success('Actualización simulada.', {
        description: `v${result.version.versionNumber} · ${result.changes.length} ${
          result.changes.length === 1 ? 'campo' : 'campos'
        } · ${result.alerts.length} ${
          result.alerts.length === 1 ? 'alerta' : 'alertas'
        }`,
      })
    },
    onError: (error) => {
      toast.error(messageFrom(error, 'No pudimos ejecutar la simulación.'))
    },
  })
}
