import { createPortal } from "react-dom";

import { useToast } from "@/hooks/useToast";

export default function AppToast() {
  const { toasts } = useToast();

  return createPortal(
    <div className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-card border-border rounded-xl border px-5 py-3 text-sm shadow-lg"
        >
          {toast.message}
        </div>
      ))}
    </div>,
    document.body,
  );
}
