import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { DEMO_LABEL } from '@/lib/demo-config'
import { cn } from '@/lib/utils'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'

const COLLAPSE_STORAGE_KEY = 'trazo:nav-collapsed'
const DESKTOP_QUERY = '(min-width: 1280px)'

function defaultCollapsed(): boolean {
  try {
    return !window.matchMedia(DESKTOP_QUERY).matches
  } catch {
    return true
  }
}

function useSidebarCollapse() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const stored = window.localStorage.getItem(COLLAPSE_STORAGE_KEY)
      return stored === null ? defaultCollapsed() : stored === 'true'
    } catch {
      return defaultCollapsed()
    }
  })

  const toggle = () => {
    setCollapsed((previous) => {
      const next = !previous
      try {
        window.localStorage.setItem(COLLAPSE_STORAGE_KEY, String(next))
      } catch {
        // La preferencia es cosmética: si el almacenamiento no está disponible,
        // la navegación sigue funcionando en memoria.
      }
      return next
    })
  }

  return { collapsed, toggle }
}

export function AppShell() {
  const { collapsed, toggle } = useSidebarCollapse()

  return (
    <div className="min-h-svh overflow-x-clip bg-canvas">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-xl focus:bg-brand-graphite focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-brand-ivory"
      >
        Saltar al contenido
      </a>

      <Sidebar collapsed={collapsed} onToggle={toggle} />

      <div
        className={cn(
          'flex min-h-svh min-w-0 flex-col transition-[padding-left] duration-200 ease-out',
          collapsed ? 'md:pl-[100px]' : 'md:pl-[272px]',
          'print:pl-0 print:md:pl-0',
        )}
      >
        <Topbar />

        <main
          id="contenido"
          tabIndex={-1}
          className="mx-auto w-full max-w-[1600px] flex-1 px-3 pt-2 pb-8 outline-none sm:px-5 lg:px-6"
        >
          <Outlet />
        </main>

        <footer className="px-3 pb-4 sm:px-5 lg:px-6 print:hidden">
          <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/70 bg-surface/60 px-4 py-3 text-xs text-muted-foreground">
            <span>trazo · Project Management &amp; Intelligence</span>
            <span>{DEMO_LABEL}</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
