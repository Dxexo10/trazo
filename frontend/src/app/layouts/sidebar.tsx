import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { isRouteActive } from '@/lib/navigation'
import { cn } from '@/lib/utils'
import {
  getActiveChildHref,
  PRIMARY_NAV,
  SECONDARY_NAV,
  type NavItem,
} from './nav-items'
import { AppearanceControl } from './appearance-control'
import { SidebarProfile } from './sidebar-profile'
import { SidebarCompactGroup, SidebarGroup } from './sidebar-submenu'

interface SidebarLinkProps {
  item: NavItem
  active: boolean
  collapsed?: boolean
  onNavigate?: () => void
}

function SidebarLink({
  item,
  active,
  collapsed = false,
  onNavigate,
}: SidebarLinkProps) {
  const Icon = item.icon

  const link = (
    <Link
      to={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      aria-label={collapsed ? item.label : undefined}
      className={cn(
        'group relative flex items-center rounded-xl text-sm font-medium transition-colors duration-200',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ivory/80',
        collapsed ? 'mx-auto size-10 justify-center' : 'gap-3 px-2.5 py-2',
        active
          ? 'bg-white/[0.07] text-brand-ivory'
          : 'text-sidebar-foreground/85 hover:bg-white/[0.05] hover:text-brand-ivory',
      )}
    >
      {active ? (
        <span
          aria-hidden="true"
          className="absolute top-1/2 -left-1 h-6 w-[3px] -translate-y-1/2 rounded-full bg-brand-terracotta"
        />
      ) : null}
      <span
        className={cn(
          'inline-flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200',
          active
            ? 'bg-primary text-primary-foreground shadow-[0_8px_18px_-10px_rgba(198,93,58,0.9)]'
            : 'text-sidebar-foreground/60 group-hover:text-brand-ivory',
        )}
      >
        <Icon aria-hidden="true" className="size-[18px]" />
      </span>
      {!collapsed ? (
        <>
          <span className="truncate">{item.label}</span>
          {item.phase ? (
            <span
              className="ml-auto rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-sidebar-foreground/55"
              aria-hidden="true"
            >
              {item.phase.replace('Fase ', 'F')}
            </span>
          ) : null}
        </>
      ) : null}
    </Link>
  )

  if (!collapsed) return link

  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent side="right" sideOffset={12}>
        {item.label}
        {item.phase ? ` · ${item.phase}` : ''}
      </TooltipContent>
    </Tooltip>
  )
}

interface SidebarContentProps {
  collapsed?: boolean
  variant?: 'desktop' | 'mobile'
  onToggle?: () => void
  onNavigate?: () => void
}

export function SidebarContent({
  collapsed = false,
  variant = 'desktop',
  onToggle,
  onNavigate,
}: SidebarContentProps) {
  const { pathname, search } = useLocation()
  const isCompact = collapsed && variant === 'desktop'
  const [groupOverrides, setGroupOverrides] = useState<Record<string, boolean>>(
    {},
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SidebarProfile
        collapsed={isCompact}
        variant={variant}
        onToggle={onToggle}
      />

      <div
        className={cn('h-px shrink-0 bg-white/10', isCompact ? 'mx-2' : 'mx-3')}
      />

      {!isCompact ? (
        <p className="shrink-0 px-5 pt-3 pb-1 text-[10px] font-semibold tracking-[0.18em] text-sidebar-foreground/45 uppercase">
          Menú
        </p>
      ) : null}

      <nav
        aria-label="Navegación principal"
        className={cn(
          'min-h-0 flex-1 space-y-1 overflow-x-hidden overflow-y-auto overscroll-contain py-2',
          isCompact ? 'px-2' : 'px-3',
        )}
      >
        {PRIMARY_NAV.map((item) => {
          const active = isRouteActive(pathname, item.href)
          const activeChildHref = getActiveChildHref(
            pathname,
            search,
            item.children,
          )

          if (item.children && isCompact) {
            return (
              <SidebarCompactGroup
                key={item.href}
                item={item}
                active={active}
                activeChildHref={activeChildHref}
                onNavigate={onNavigate}
              />
            )
          }

          if (item.children) {
            const open =
              groupOverrides[item.href] ?? (active || activeChildHref !== null)

            return (
              <SidebarGroup
                key={item.href}
                item={item}
                active={active}
                open={open}
                activeChildHref={activeChildHref}
                onToggle={() =>
                  setGroupOverrides((previous) => ({
                    ...previous,
                    [item.href]: !open,
                  }))
                }
                onNavigate={onNavigate}
              />
            )
          }

          return (
            <SidebarLink
              key={item.href}
              item={item}
              active={active}
              collapsed={isCompact}
              onNavigate={onNavigate}
            />
          )
        })}
      </nav>

      <div
        className={cn(
          'shrink-0 space-y-1 border-t border-white/10',
          isCompact ? 'px-2 py-2' : 'px-3 py-3',
        )}
      >
        <AppearanceControl collapsed={isCompact} />

        {SECONDARY_NAV.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            active={isRouteActive(pathname, item.href)}
            collapsed={isCompact}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  )
}

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        'fixed top-4 bottom-4 left-3 z-40 hidden flex-col overflow-hidden rounded-[22px] border border-white/[0.07] bg-sidebar bg-[image:radial-gradient(120%_80%_at_0%_0%,rgba(198,93,58,0.12),transparent_55%)] text-sidebar-foreground shadow-[0_24px_60px_-30px_rgba(37,40,36,0.7)] transition-[width] duration-200 ease-out md:flex print:hidden',
        collapsed ? 'w-[76px]' : 'w-[248px]',
      )}
    >
      <SidebarContent collapsed={collapsed} onToggle={onToggle} />
    </aside>
  )
}
