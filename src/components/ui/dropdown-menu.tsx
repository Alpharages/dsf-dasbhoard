import * as React from "react"
import { cn } from "@/lib/utils"

// Simple Dropdown Menu implementation without Radix UI

interface DropdownMenuProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const DropdownMenuContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({ open: false, setOpen: () => {} })

function DropdownMenu({ children, open: controlledOpen, onOpenChange }: DropdownMenuProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
  const setOpen = onOpenChange || setUncontrolledOpen

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      {children}
    </DropdownMenuContext.Provider>
  )
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

function DropdownMenuTrigger({ children, asChild }: DropdownMenuTriggerProps) {
  const { open, setOpen } = React.useContext(DropdownMenuContext)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setOpen(!open)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>, {
      onClick: handleClick,
    })
  }

  return <button onClick={handleClick}>{children}</button>
}

interface DropdownMenuContentProps {
  children: React.ReactNode
  className?: string
  align?: "start" | "center" | "end"
  sideOffset?: number
}

function DropdownMenuContent({ 
  children, 
  className, 
  align = "center",
  sideOffset = 4 
}: DropdownMenuContentProps) {
  const { open, setOpen } = React.useContext(DropdownMenuContext)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open, setOpen])

  if (!open) return null

  const alignClass = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  }[align]

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-800 bg-slate-900 p-1 shadow-md",
        "animate-in fade-in-0 zoom-in-95",
        alignClass,
        className
      )}
      style={{ marginTop: sideOffset }}
    >
      {children}
    </div>
  )
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

function DropdownMenuItem({ children, className, onClick }: DropdownMenuItemProps) {
  const { setOpen } = React.useContext(DropdownMenuContext)

  const handleClick = () => {
    onClick?.()
    setOpen(false)
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "hover:bg-slate-800 focus:bg-slate-800",
        className
      )}
    >
      {children}
    </button>
  )
}

interface DropdownMenuSeparatorProps {
  className?: string
}

function DropdownMenuSeparator({ className }: DropdownMenuSeparatorProps) {
  return (
    <div className={cn("-mx-1 my-1 h-px bg-slate-800", className)} />
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
}
