import { RouterProvider } from "react-router-dom";

import AppToast from "@/components/AppToast";
import { ToastProvider } from "@/context/ToastContext";

import { router } from "./router";

export default function App() {
  return (
    <ToastProvider>
      <RouterProvider router={router} />
      <AppToast />
    </ToastProvider>
  );
}
