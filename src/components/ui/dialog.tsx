import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DialogContainerContext } from '@/components/ui/dialog-container-context'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

function hasOpenNestedLayer() {
  return !!(
    document.querySelector('[data-slot="select-content"][data-state="open"]') ||
    document.querySelector('[data-slot="popover-content"][data-state="open"]') ||
    document.querySelector('[role="listbox"][data-state="open"]')
  )
}

function isNestedLayerTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false
  return !!(
    target.closest('[data-slot="select-content"]') ||
    target.closest('[data-slot="popover-content"]') ||
    target.closest('[role="listbox"]')
  )
}

function handleDialogOutsideEvent(
  event: { preventDefault: () => void; target: EventTarget | null },
  nestedLayerWasOpen: boolean,
) {
  if (nestedLayerWasOpen || isNestedLayerTarget(event.target) || hasOpenNestedLayer()) {
    event.preventDefault()
  }
}

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T | null) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    })
  }
}

const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-black/50', className)}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, onPointerDownOutside, onInteractOutside, onFocusOutside, ...props }, ref) => {
  const [portalContainer, setPortalContainer] = React.useState<HTMLElement | null>(null)
  const nestedLayerWasOpenRef = React.useRef(false)

  React.useEffect(() => {
    const onPointerDownCapture = () => {
      nestedLayerWasOpenRef.current = hasOpenNestedLayer()
    }
    document.addEventListener('pointerdown', onPointerDownCapture, true)
    return () => document.removeEventListener('pointerdown', onPointerDownCapture, true)
  }, [])

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogContainerContext.Provider value={portalContainer}>
        <DialogPrimitive.Content
          ref={mergeRefs(ref, setPortalContainer)}
          data-slot="dialog-content"
          className={cn(
            'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg max-h-[90vh] overflow-y-auto',
            className,
          )}
          {...props}
          onPointerDownOutside={(event) => {
            handleDialogOutsideEvent(event, nestedLayerWasOpenRef.current)
            nestedLayerWasOpenRef.current = false
            onPointerDownOutside?.(event)
          }}
          onInteractOutside={(event) => {
            handleDialogOutsideEvent(event, nestedLayerWasOpenRef.current)
            nestedLayerWasOpenRef.current = false
            onInteractOutside?.(event)
          }}
          onFocusOutside={(event) => {
            if (nestedLayerWasOpenRef.current || hasOpenNestedLayer()) {
              event.preventDefault()
            }
            onFocusOutside?.(event)
          }}
        >
          {children}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring">
            <X className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogContainerContext.Provider>
    </DialogPortal>
  )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn('text-sm text-muted-foreground', className)} {...props} />
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
}

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
}
