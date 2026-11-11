import { Link, useLocation } from 'react-router-dom'
import { BellRing } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { initials } from '@/domain/utils/format'
import { ROLE_LABELS } from '@/lib/labels'
import { DEMO_CURRENT_USER } from '@/data/mock/seed/users'
import { ROUTE_TITLES } from './nav-items'
import { MobileNav } from './mobile-nav'
import { useOpenAlertsCount } from '@/features/alerts/hooks/use-open-alerts'

function resolveTitle(pathname: string): string {
  const exact = ROUTE_TITLES[pathname]
  if (exact) return exact
  if (/^\/projects\/[^/]+\/edit$/.test(pathname)) return 'Editar proyecto'
  if (/^\/projects\/[^/]+$/.test(pathname)) return 'Detalle del proyecto'
  return 'Página no encontrada'
}

function Breadcrumb() {
  const { pathname } = useLocation()
  const title = resolveTitle(pathname)
  const parent = pathname.startsWith('/projects')
    ? { label: 'Proyectos', href: '/projects' }
    : null

  return (
    <nav aria-label="Ruta de navegación" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-2 text-sm">
        <li className="hidden font-heading text-[13px] font-semibold tracking-tight text-foreground sm:block">
          trazo<span className="text-brand-terracotta">.</span>
        </li>
        <li aria-hidden="true" className="hidden text-brand-sand sm:block">
          /
        </li>
        {parent && parent.href !== pathname ? (
          <>
            <li className="hidden sm:block">
              <Link
                to={parent.href}
                className="rounded text-muted-foreground transition-colors hover:text-foreground"
              >
                {parent.label}
              </Link>
            </li>
            <li aria-hidden="true" className="hidden text-brand-sand sm:block">
              /
            </li>
          </>
        ) : null}
        <li className="truncate font-medium text-foreground">{title}</li>
      </ol>
    </nav>
  )
}

function DemoIndicator() {
  return (
    <span
      className="hidden items-center gap-1.5 rounded-full border border-brand-terracotta/20 bg-brand-terracotta-subtle px-2.5 py-1 text-[11px] font-medium text-brand-terracotta-hover md:inline-flex"
      title="Entorno de demostración · Datos simulados"
    >
      <span
        aria-hidden="true"
        className="size-1.5 rounded-full bg-brand-terracotta"
      />
      Demo · datos simulados
    </span>
  )
}

function AlertsShortcut() {
  const { data: openAlerts } = useOpenAlertsCount()
  const count = openAlerts ?? 0

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative text-text-secondary hover:bg-brand-terracotta-subtle hover:text-brand-terracotta-hover"
      render={<Link to="/alerts" />}
      aria-label={`${count > 9 ? '9+' : count} · Centro de alertas: ${count} alertas abiertas`}
    >
      <BellRing aria-hidden="true" className="size-[18px]" />
      {count > 0 ? (
        <span
          aria-hidden="true"
          className="absolute -top-0.5 -right-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-4 text-primary-foreground"
        >
          {count > 9 ? '9+' : count}
        </span>
      ) : null}
    </Button>
  )
}

function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-sand-soft"
            aria-label={`${initials(DEMO_CURRENT_USER.name)} · Abrir menú de perfil de ${DEMO_CURRENT_USER.name}`}
          />
        }
      >
        <Avatar size="sm" aria-hidden="true">
          <AvatarFallback className="bg-brand-graphite text-[11px] font-semibold text-brand-ivory">
            {initials(DEMO_CURRENT_USER.name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-xl">
        <DropdownMenuLabel>Perfil de demostración</DropdownMenuLabel>
        <div className="px-1.5 pb-2">
          <p className="text-sm font-medium text-foreground">
            {DEMO_CURRENT_USER.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {DEMO_CURRENT_USER.email}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {ROLE_LABELS[DEMO_CURRENT_USER.role]}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={<Link to="/settings" />}
          className="cursor-pointer"
        >
          Configuración demo
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 bg-canvas px-3 pt-3 sm:px-5 lg:px-6 print:hidden">
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="flex h-14 items-center gap-2 rounded-3xl border border-brand-sand/90 bg-surface/95 px-3 shadow-card backdrop-blur-sm sm:px-4">
          <MobileNav />
          <Breadcrumb />

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <DemoIndicator />
            <AlertsShortcut />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
