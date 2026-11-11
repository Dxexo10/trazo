import type { Project, ProjectStatus, Sector } from '../models/index.js'
import { addDays, addMonths, parseDate, toISODate } from '../utils/date.js'
import { DEMO_CURRENCY, DEMO_REFERENCE_DATE } from '../../lib/demo-config.js'
import { pick, pickMany, randomBetween, randomInt, stableId } from './random.js'
import { DEMO_USERS } from './users.js'

interface ProjectBlueprint {
  name: string
  sector: Sector
  tags: readonly string[]
}

const BLUEPRINTS: readonly ProjectBlueprint[] = [
  {
    name: 'Implementación de ERP corporativo',
    sector: 'technology',
    tags: ['ERP', 'procesos'],
  },
  {
    name: 'Modernización de infraestructura tecnológica',
    sector: 'technology',
    tags: ['infraestructura', 'cloud'],
  },
  {
    name: 'Migración a servicios cloud',
    sector: 'technology',
    tags: ['cloud', 'arquitectura'],
  },
  {
    name: 'Implementación de sistema de inventarios',
    sector: 'technology',
    tags: ['logística', 'datos'],
  },
  {
    name: 'Automatización de reportes financieros',
    sector: 'technology',
    tags: ['automatización', 'finanzas'],
  },
  {
    name: 'Plataforma de comercio electrónico B2B',
    sector: 'technology',
    tags: ['e-commerce', 'producto'],
  },
  {
    name: 'Rediseño del portal de clientes',
    sector: 'technology',
    tags: ['experiencia', 'producto'],
  },
  {
    name: 'Integración de pasarela de pagos',
    sector: 'technology',
    tags: ['pagos', 'integración'],
  },
  {
    name: 'Sistema de gestión documental',
    sector: 'technology',
    tags: ['documentos', 'procesos'],
  },
  {
    name: 'Observabilidad y monitoreo de aplicaciones',
    sector: 'technology',
    tags: ['monitoreo', 'confiabilidad'],
  },
  {
    name: 'Construcción de centro logístico',
    sector: 'construction',
    tags: ['logística', 'obra civil'],
  },
  {
    name: 'Remodelación de sede administrativa',
    sector: 'construction',
    tags: ['remodelación', 'oficinas'],
  },
  {
    name: 'Ampliación de planta industrial',
    sector: 'construction',
    tags: ['planta', 'capacidad'],
  },
  {
    name: 'Construcción de oficinas corporativas',
    sector: 'construction',
    tags: ['oficinas', 'obra civil'],
  },
  {
    name: 'Rehabilitación de almacén central',
    sector: 'construction',
    tags: ['almacén', 'infraestructura'],
  },
  {
    name: 'Obra civil para data center',
    sector: 'construction',
    tags: ['obra civil', 'data center'],
  },
  {
    name: 'Construcción de centro de distribución norte',
    sector: 'construction',
    tags: ['distribución', 'logística'],
  },
  {
    name: 'Mejora de accesos y estacionamientos',
    sector: 'construction',
    tags: ['accesos', 'seguridad'],
  },
  {
    name: 'Transformación de procesos comerciales',
    sector: 'consulting',
    tags: ['procesos', 'comercial'],
  },
  {
    name: 'Diseño de modelo operativo',
    sector: 'consulting',
    tags: ['operaciones', 'diseño'],
  },
  {
    name: 'Programa de eficiencia de costos',
    sector: 'consulting',
    tags: ['costos', 'eficiencia'],
  },
  {
    name: 'Reestructuración organizacional',
    sector: 'consulting',
    tags: ['organización', 'talento'],
  },
  {
    name: 'Plan de continuidad del negocio',
    sector: 'consulting',
    tags: ['riesgo', 'continuidad'],
  },
  {
    name: 'Diagnóstico de madurez digital',
    sector: 'consulting',
    tags: ['digital', 'diagnóstico'],
  },
  {
    name: 'Implementación de marco de gobierno de TI',
    sector: 'consulting',
    tags: ['gobierno', 'TI'],
  },
  {
    name: 'Estrategia de expansión regional',
    sector: 'consulting',
    tags: ['estrategia', 'expansión'],
  },
  {
    name: 'Optimización de cadena de suministro',
    sector: 'consulting',
    tags: ['suministro', 'logística'],
  },
  {
    name: 'Programa de experiencia de cliente',
    sector: 'consulting',
    tags: ['experiencia', 'cliente'],
  },
]

const CLIENTS = [
  'Grupo Andino',
  'Minera del Sur',
  'Banco Cordillera',
  'Retail Nova',
  'Constructora Vento',
  'Telecom Pacífico',
  'AgroFértil',
  'Seguros Altamar',
  'Salud Integral',
  'Energía Austral',
  'Logística Rumbos',
  'EducaPro',
] as const

const STATUS_PATTERN: readonly ProjectStatus[] = [
  'in_progress',
  'completed',
  'in_progress',
  'planned',
  'in_progress',
  'on_hold',
  'completed',
  'in_progress',
  'in_progress',
  'cancelled',
  'completed',
  'in_progress',
  'on_hold',
  'in_progress',
  'completed',
  'planned',
  'in_progress',
  'completed',
  'in_progress',
  'on_hold',
  'completed',
  'in_progress',
  'planned',
  'in_progress',
  'completed',
  'in_progress',
  'cancelled',
  'completed',
  'in_progress',
  'on_hold',
  'completed',
  'in_progress',
  'planned',
  'in_progress',
  'completed',
  'in_progress',
  'on_hold',
  'completed',
  'in_progress',
  'cancelled',
  'completed',
  'in_progress',
  'planned',
  'completed',
  'in_progress',
  'on_hold',
  'completed',
  'in_progress',
  'cancelled',
  'planned',
]

const BUDGET_RANGES: Record<Sector, readonly [number, number]> = {
  technology: [350_000, 4_200_000],
  construction: [1_200_000, 8_500_000],
  consulting: [120_000, 1_100_000],
}

const DURATION_MONTHS: Record<Sector, readonly [number, number]> = {
  technology: [5, 14],
  construction: [10, 22],
  consulting: [3, 9],
}

const VARIANCE_RANGES: Record<ProjectStatus, readonly [number, number]> = {
  planned: [0, 0.03],
  in_progress: [-0.05, 0.24],
  on_hold: [0.04, 0.32],
  completed: [-0.02, 0.09],
  cancelled: [-0.03, 0.05],
}

const PROGRESS_RANGES: Record<ProjectStatus, readonly [number, number]> = {
  planned: [0, 0],
  in_progress: [10, 95],
  on_hold: [15, 70],
  completed: [100, 100],
  cancelled: [10, 60],
}

const PRIORITY_WEIGHTS = [
  { value: 'low', weight: 0.2 },
  { value: 'medium', weight: 0.4 },
  { value: 'high', weight: 0.28 },
  { value: 'critical', weight: 0.12 },
] as const

function pickPriority(random: () => number) {
  const roll = random()
  let accumulated = 0
  for (const entry of PRIORITY_WEIGHTS) {
    accumulated += entry.weight
    if (roll <= accumulated) return entry.value
  }
  return 'medium' as const
}

function roundToTenThousand(soles: number): number {
  return Math.round(soles / 10_000) * 10_000
}

export const PROJECT_COUNT = 50

export function generateProjects(random: () => number): Project[] {
  const reference = parseDate(DEMO_REFERENCE_DATE)

  return Array.from({ length: PROJECT_COUNT }, (_, index) => {
    const blueprint = BLUEPRINTS[index % BLUEPRINTS.length] as ProjectBlueprint
    const status = STATUS_PATTERN[index] as ProjectStatus
    const owner = pick(random, DEMO_USERS)
    const client = pick(random, CLIENTS)
    const priority = pickPriority(random)

    const [minBudget, maxBudget] = BUDGET_RANGES[blueprint.sector]
    const initialSoles =
      index === 47
        ? 0
        : roundToTenThousand(randomBetween(random, minBudget, maxBudget))

    const [minVariance, maxVariance] = VARIANCE_RANGES[status]
    const variance = randomBetween(random, minVariance, maxVariance)
    const currentSoles =
      initialSoles === 0
        ? 320_000
        : roundToTenThousand(initialSoles * (1 + variance))

    const [minProgress, maxProgress] = PROGRESS_RANGES[status]
    const progress = randomInt(random, minProgress, maxProgress)

    const startDate = addDays(reference, -randomInt(random, 70, 560))
    const [minDuration, maxDuration] = DURATION_MONTHS[blueprint.sector]
    let dueDate = addMonths(
      startDate,
      randomInt(random, minDuration, maxDuration),
    )

    if (status === 'planned' && dueDate < reference) {
      dueDate = addDays(reference, randomInt(random, 20, 120))
    }

    if (status === 'in_progress' && index % 6 === 0) {
      dueDate = addDays(reference, -randomInt(random, 5, 45))
    }

    let completedAt: string | null = null
    if (status === 'completed') {
      const candidate = addDays(dueDate, randomInt(random, -10, 25))
      completedAt = toISODate(
        candidate > reference
          ? addDays(reference, -randomInt(random, 2, 20))
          : candidate,
      )
    }

    const createdAt = new Date(
      addDays(startDate, -randomInt(random, 8, 25)).getTime() +
        randomInt(random, 0, 8) * 3_600_000,
    )
    let updatedAt = new Date(
      reference.getTime() -
        randomInt(random, 0, 55) * 86_400_000 -
        randomInt(random, 0, 20) * 3_600_000,
    )
    if (updatedAt.getTime() <= createdAt.getTime()) {
      updatedAt = new Date(createdAt.getTime() + 86_400_000)
    }

    const name =
      index < BLUEPRINTS.length ? blueprint.name : `${blueprint.name} — Fase II`

    return {
      id: stableId(2, index + 1),
      code: `PRJ-${String(index + 1).padStart(3, '0')}`,
      name,
      description: `${name} para ${client}. Abarca planificación, ejecución y cierre con seguimiento quincenal de presupuesto y cronograma.`,
      sector: blueprint.sector,
      client,
      ownerId: owner.id,
      status,
      priority,
      initialBudgetCents: initialSoles * 100,
      currentBudgetCents: currentSoles * 100,
      currency: DEMO_CURRENCY,
      progress,
      startDate: toISODate(startDate),
      dueDate: toISODate(dueDate),
      completedAt,
      tags: pickMany(random, blueprint.tags, 2),
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      archivedAt: null,
    }
  })
}
