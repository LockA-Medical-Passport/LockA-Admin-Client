export type ToastVariant = "success" | "error" | "pending";

export interface ToastOptions {
  title?: string;
  txHash?: string;
  duration?: number;
}

export interface ToastItem extends ToastOptions {
  id: string;
  variant: ToastVariant;
  message: string;
}

type Listener = () => void;

let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

function addToast(variant: ToastVariant, message: string, options: ToastOptions = {}) {
  const id = crypto.randomUUID();
  toasts = [...toasts, { id, variant, message, ...options }];
  emit();

  const duration = options.duration ?? 5000;
  if (duration > 0) {
    setTimeout(() => dismissToast(id), duration);
  }
  return id;
}

export function dismissToast(id: string) {
  toasts = toasts.filter((item) => item.id !== id);
  emit();
}

export function subscribeToasts(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getToastSnapshot() {
  return toasts;
}

export const toast = {
  success: (message: string, options?: ToastOptions) => addToast("success", message, options),
  error: (message: string, options?: ToastOptions) => addToast("error", message, options),
  /**
   * In-flight work (e.g. a ProviderRegistry transaction). Sticky by default: the caller holds
   * the returned id and calls `dismissToast(id)` when the outcome toast replaces it.
   */
  pending: (message: string, options?: ToastOptions) =>
    addToast("pending", message, { duration: 0, ...options }),
};
