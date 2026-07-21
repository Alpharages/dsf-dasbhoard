import * as React from "react"
import { createPortal } from "react-dom"
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
  triggerRef: React.RefObject<HTMLElement | null>
}>({ open: false, setOpen: () => {}, triggerRef: { current: null } })

function DropdownMenu({ children, open: controlledOpen, onOpenChange }: DropdownMenuProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
  const setOpen = onOpenChange || setUncontrolledOpen
  const triggerRef = React.useRef<HTMLElement | null>(null)

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef }}>
      {children}
    </DropdownMenuContext.Provider>
  )
}

interface DropdownMenuTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

function DropdownMenuTrigger({ children, asChild, onClick: _onClick, ...props }: DropdownMenuTriggerProps) {
  const { open, setOpen, triggerRef } = React.useContext(DropdownMenuContext)
  const localRef = React.useRef<HTMLButtonElement>(null)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setOpen(!open)
  }

  const setRefs = (el: HTMLButtonElement | null) => {
    localRef.current = el
    triggerRef.current = el
  }

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ 
      onClick?: (e: React.MouseEvent) => void
      ref?: React.Ref<HTMLElement>
    }>
    return React.cloneElement(child, {
      onClick: handleClick,
      ref: (el: HTMLElement | null) => {
        triggerRef.current = el
      },
    })
  }

  return (
    <button ref={setRefs} onClick={handleClick} data-dropdown-trigger="true" {...props}>
      {children}
    </button>
  )
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
  const { open, setOpen, triggerRef } = React.useContext(DropdownMenuContext)
  const [position, setPosition] = React.useState<{top: number, left: number | 'auto', right: number | 'auto'}>({ top: 0, left: 0, right: 'auto' })
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (open && triggerRef.current) {
      const trigger = triggerRef.current
      const rect = trigger.getBoundingClientRect()
      
      let left: number | 'auto' = rect.left
      let right: number | 'auto' = 'auto'
      
      if (align === 'center') {
        left = rect.left + rect.width / 2
      } else if (align === 'end') {
        right = window.innerWidth - rect.right
        left = 'auto' as const
      }
      
      setPosition({
        top: rect.bottom + sideOffset,
        left: left === 'auto' ? 'auto' as const : left,
        right: right
      })
    }
  }, [open, align, sideOffset, triggerRef])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
          setOpen(false)
        }
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open, setOpen, triggerRef])

  if (!open) return null

  const dropdownContent = (
    <div
      ref={ref}
      className={cn(
        "fixed z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover p-1 shadow-md",
        "animate-in fade-in-0 zoom-in-95",
        className
      )}
      style={{ 
        top: position.top, 
        left: position.left === 'auto' ? 'auto' : position.left,
        right: position.right === 'auto' ? 'auto' : position.right,
        transform: align === 'center' ? 'translateX(-50%)' : undefined
      }}
    >
      {children}
    </div>
  )

  return createPortal(dropdownContent, document.body)
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
}

function DropdownMenuItem({ children, className, onClick, disabled }: DropdownMenuItemProps) {
  const { setOpen } = React.useContext(DropdownMenuContext)

  const handleClick = () => {
    if (disabled) return
    onClick?.()
    setOpen(false)
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        "disabled:pointer-events-none disabled:opacity-50",
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
    <div className={cn("-mx-1 my-1 h-px bg-border", className)} />
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
}
