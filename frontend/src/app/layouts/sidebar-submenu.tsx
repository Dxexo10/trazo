import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { NavItem } from './nav-items'

const ACTIVE_ICON =
  'bg-primary text-primary-foreground shadow-[0_8px_18px_-10px_rgba(198,93,58,0.9)]'

const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ivory/80'

interface SidebarGroupProps {
  item: NavItem
  active: boolean
  open: boolean
  activeChildHref: string | null
  onToggle: () => void
  onNavigate?: () => void
}

export function SidebarGroup({
  item,
  active,
  open,
  activeChildHref,
  onToggle,
  onNavigate,
}: SidebarGroupProps) {
  const Icon = item.icon
  const submenuId = useId()

  return (
    <div>
      <div
        className={cn(
          'group relative flex items-center rounded-xl transition-colors duration-200',
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

        <Link
          to={item.href}
          onClick={onNavigate}
          aria-current={active ? 'page' : undefined}
          className={cn(
            'flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium',
            FOCUS_RING,
          )}
        >
          <span
            className={cn(
              'inline-flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200',
              active
                ? ACTIVE_ICON
                : 'text-sidebar-foreground/60 group-hover:text-brand-ivory',
            )}
          >
            <Icon aria-hidden="true" className="size-[18px]" />
          </span>
          <span className="truncate">{item.label}</span>
        </Link>

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={submenuId}
          aria-label={`${open ? 'Contraer' : 'Expandir'} ${item.label}`}
          className={cn(
            'mr-1 inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/60 transition-colors hover:bg-white/10 hover:text-brand-ivory',
            FOCUS_RING,
          )}
        >
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'size-4 transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </button>
      </div>

      {open ? (
        <ul
          id={submenuId}
          className="relative mt-1 ml-6 space-y-0.5 border-l border-white/10 py-0.5 pl-3"
        >
          {(item.children ?? []).map((child) => {
            const isActive = activeChildHref === child.href

            return (
              <li key={child.label} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 -left-3 h-px w-2 bg-white/15"
                />

                <Link
                  to={child.href}
                  onClick={onNavigate}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center rounded-lg px-2 py-1.5 text-[13px] transition-colors',
                    isActive
                      ? 'bg-white/[0.06] font-medium text-brand-ivory'
                      : 'text-sidebar-foreground/70 hover:bg-white/[0.05] hover:text-brand-ivory',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'mr-2 size-1.5 rounded-full',
                      isActive ? 'bg-brand-terracotta' : 'bg-white/20',
                    )}
                  />
                  {child.label}
                </Link>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

interface SidebarCompactGroupProps {
  item: NavItem
  active: boolean
  activeChildHref: string | null
  onNavigate?: () => void
}

export function SidebarCompactGroup({
  item,
  active,
  activeChildHref,
  onNavigate,
}: SidebarCompactGroupProps) {
  const Icon = item.icon
  const [open, setOpen] = useState(false)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)
  const hasActiveChild = activeChildHref !== null

  useEffect(() => {
    if (!open) return

    const timeoutId = window.setTimeout(() => {
      firstLinkRef.current?.focus()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [open])

  const close = () => setOpen(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={item.label}
            aria-haspopup="dialog"
            title={item.label}
            className={cn(
              'group relative mx-auto flex size-10 items-center justify-center rounded-xl transition-colors duration-200',
              FOCUS_RING,
              active || hasActiveChild
                ? 'bg-white/[0.07] text-brand-ivory'
                : 'text-sidebar-foreground/85 hover:bg-white/[0.05] hover:text-brand-ivory',
            )}
          />
        }
      >
        <span
          className={cn(
            'inline-flex size-8 items-center justify-center rounded-lg transition-colors duration-200',
            active
              ? ACTIVE_ICON
              : 'text-sidebar-foreground/60 group-hover:text-brand-ivory',
          )}
        >
          <Icon aria-hidden="true" className="size-[18px]" />
        </span>
        {hasActiveChild ? (
          <span
            aria-hidden="true"
            className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-brand-terracotta"
          />
        ) : null}
      </PopoverTrigger>

      <PopoverContent
        side="right"
        align="start"
        sideOffset={12}
        className="w-60 gap-1 border border-white/10 bg-brand-graphite p-1.5 text-sidebar-foreground shadow-xl"
      >
        <p className="px-2 py-1.5 text-[10px] font-semibold tracking-[0.16em] text-sidebar-foreground/50 uppercase">
          {item.label}
        </p>
        <ul className="space-y-0.5">
          {(item.children ?? []).map((child, index) => {
            const isActive = activeChildHref === child.href

            return (
              <li key={child.label}>
                <Link
                  ref={index === 0 ? firstLinkRef : undefined}
                  to={child.href}
                  onClick={() => {
                    close()
                    onNavigate?.()
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors',
                    isActive
                      ? 'bg-white/[0.08] font-medium text-brand-ivory'
                      : 'text-sidebar-foreground/80 hover:bg-white/[0.06] hover:text-brand-ivory',
                    FOCUS_RING,
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'size-1.5 rounded-full',
                      isActive ? 'bg-brand-terracotta' : 'bg-white/20',
                    )}
                  />
                  {child.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
