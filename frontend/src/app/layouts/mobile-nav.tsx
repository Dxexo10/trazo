import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { SidebarContent } from './sidebar'

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Abrir navegación"
          />
        }
      >
        <Menu aria-hidden="true" className="size-5" />
      </SheetTrigger>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-[300px] max-w-[85vw] gap-0 border-white/10 bg-sidebar p-0 text-sidebar-foreground sm:max-w-[300px]"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Navegación principal</SheetTitle>
          <SheetDescription>
            Módulos, apariencia y configuración de Trazo.
          </SheetDescription>
        </SheetHeader>

        <SheetClose
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute top-3 right-3 z-10 text-sidebar-foreground/60 hover:bg-white/10 hover:text-brand-ivory"
              aria-label="Cerrar navegación"
            />
          }
        >
          <X aria-hidden="true" className="size-4" />
        </SheetClose>

        <div className="flex min-h-0 flex-1 flex-col pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]">
          <SidebarContent variant="mobile" onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
