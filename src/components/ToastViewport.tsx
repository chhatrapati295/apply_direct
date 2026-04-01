export type ToastState = {
  title: string
  message: string
  variant: 'success' | 'error'
}

type ToastViewportProps = {
  toast: ToastState | null
  onDismiss: () => void
}

export function ToastViewport({ toast, onDismiss }: ToastViewportProps) {
  if (!toast) {
    return null
  }

  return (
    <div
      className="toast-region"
      aria-live={toast.variant === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <div className={`toast is-${toast.variant}`} role="status">
        <div className="toast-topline">
          <strong>{toast.title}</strong>
          <button type="button" onClick={onDismiss} aria-label="Dismiss message">
            Close
          </button>
        </div>
        <p>{toast.message}</p>
      </div>
    </div>
  )
}
