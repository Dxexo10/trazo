import type { LucideIcon } from 'lucide-react'
import {
  BellRing,
  FolderKanban,
  History,
  LayoutDashboard,
  Radar,
  Settings,
} from 'lucide-react'
import { isRouteActive } from '@/lib/navigation'

export interface NavChild {
  label: string
  href: string
}

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  phase?: string
  children?: NavChild[]
}

export const PRIMARY_NAV: NavItem[] = [
  { label: 'Resumen general', href: '/dashboard', icon: LayoutDashboard },
  {
    label: 'Proyectos',
    href: '/projects',
    icon: FolderKanban,
    children: [
      { label: 'Todos los proyectos', href: '/projects' },
      { label: 'En ejecución', href: '/projects?estado=in_progress' },
      { label: 'Archivados', href: '/projects?archivados=solo' },
    ],
  },
  {
    label: 'Monitor de cambios',
    href: '/monitor',
    icon: Radar,
    children: [
      { label: 'Cambios recientes', href: '/monitor' },
      {
        label: 'Historial de versiones',
        href: '/activity?accion=version.created',
      },
    ],
  },
  {
    label: 'Centro de alertas',
    href: '/alerts',
    icon: BellRing,
    children: [
      { label: 'Alertas abiertas', href: '/alerts?estado=open' },
      { label: 'Alertas revisadas', href: '/alerts?estado=reviewed' },
    ],
  },
  { label: 'Actividad', href: '/activity', icon: History },
]

export const SECONDARY_NAV: NavItem[] = [
  {
    label: 'Configuración demo',
    href: '/settings',
    icon: Settings,
  },
]

export const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Resumen general',
  '/projects': 'Proyectos',
  '/projects/new': 'Nuevo proyecto',
  '/monitor': 'Monitor de cambios',
  '/alerts': 'Centro de alertas',
  '/activity': 'Actividad',
  '/settings': 'Configuración demo',
}

function matchesChild(pathname: string, search: string, href: string): boolean {
  const url = new URL(href, 'http://trazo.local')
  if (pathname !== url.pathname) return false

  const current = new URLSearchParams(search)

  for (const [key, value] of url.searchParams) {
    if (current.get(key) !== value) return false
  }

  return true
}

/**
 * Returns the most specific child link for the current route, so that
 * "Todos los proyectos" and "En ejecución" never appear active at once.
 */
export function getActiveChildHref(
  pathname: string,
  search: string,
  children: readonly NavChild[] | undefined,
): string | null {
  if (!children) return null

  let best: { href: string; score: number } | null = null

  for (const child of children) {
    if (!child.href || !matchesChild(pathname, search, child.href)) continue

    const score = new URL(child.href, 'http://trazo.local').searchParams.size

    if (!best || score > best.score) {
      best = { href: child.href, score }
    }
  }

  return best?.href ?? null
}

export function isNavChildActive(
  pathname: string,
  search: string,
  href: string,
): boolean {
  return matchesChild(pathname, search, href)
}

export function isNavParentActive(pathname: string, item: NavItem): boolean {
  return isRouteActive(pathname, item.href)
}
