import { createContext, useCallback, useContext, useRef, useState } from "react";

type Toast = { id: number; message: string };

type ToastContextValue = {
  showToast: (message: string, options?: { duration?: number }) => void;
  toasts: Toast[];
};

export const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const showToast = useCallback((message: string, { duration = 2500 } = {}) => {
    const id = ++counterRef.current;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  return <ToastContext.Provider value={{ showToast, toasts }}>{children}</ToastContext.Provider>;
}

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToastContext must be used within ToastProvider");
  return ctx;
}
