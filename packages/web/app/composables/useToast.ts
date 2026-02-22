/**
 * Toast Notification System (Sistema de notificaciones Toast)
 * File: composables/useToast.ts
 *
 * A lightweight, global notification system for showing real-time feedback
 * to the user (new tickets, updates, errors, etc.).
 *
 * WHY useState() AND NOT ref()?
 * - `ref()` creates component-scoped state → each composable call creates its own list
 * - `useState()` is Nuxt's SSR-safe shared state → ALL calls share the same array
 *   This means Toast.vue and the page that calls show() see the same data.
 *
 * (¿POR QUÉ useState() Y NO ref()?
 *  - `ref()` crea estado a nivel de componente → cada llamada crea su propia lista
 *  - `useState()` es el estado compartido SSR-safe de Nuxt → TODAS las llamadas comparten el mismo array
 *   Esto significa que Toast.vue y la página que llama a show() ven los mismos datos.)
 */

export type ToastType = 'info' | 'success' | 'warning' | 'error'

export interface Toast {
  id: number
  message: string
  type: ToastType
}

// Internal counter — not reactive, just increments on each toast
// (Contador interno — no reactivo, solo incrementa en cada toast)
let _nextId = 0

export const useToast = () => {
  // useState key 'toasts' ensures all composable calls share the same array
  // (La clave 'toasts' en useState asegura que todas las llamadas al composable comparten el mismo array)
  const toasts = useState<Toast[]>('toasts', () => [])

  /**
   * Show a toast notification.
   * duration: milliseconds before auto-dismiss (0 = permanent until dismissed)
   *
   * (Mostrar una notificación toast.
   *  duration: milisegundos antes de auto-descarte (0 = permanente hasta descartarlo))
   */
  function show(message: string, type: ToastType = 'info', duration = 4500) {
    const id = _nextId++
    // Spread to new array to trigger Vue reactivity (recreate on push)
    // (Spread a nuevo array para disparar la reactividad de Vue)
    toasts.value = [...toasts.value, { id, message, type }]

    if (duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }
  }

  /**
   * Manually dismiss a toast by its ID.
   * (Descartar manualmente un toast por su ID.)
   */
  function dismiss(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  // Convenience wrappers (Envolturas convenientes)
  const info    = (msg: string, d?: number) => show(msg, 'info', d)
  const success = (msg: string, d?: number) => show(msg, 'success', d)
  const warning = (msg: string, d?: number) => show(msg, 'warning', d)
  const error   = (msg: string, d?: number) => show(msg, 'error', d)

  return { toasts, show, dismiss, info, success, warning, error }
}
