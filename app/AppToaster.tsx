'use client';

import { Toaster } from 'sonner';

/** Toasts compatíveis com React 19 (substitui react-hot-toast, que causava removeChild + App Router). */
export function AppToaster() {
  return <Toaster position="top-right" richColors closeButton className="print:hidden" />;
}
