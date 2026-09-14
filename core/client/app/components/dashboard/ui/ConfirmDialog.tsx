"use client";

import { useCallback, useState, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "@/app/components/ui/Button";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

export function useConfirmDialog() {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ ...options, resolve });
    });
  }, []);

  const settle = (value: boolean) => {
    state?.resolve(value);
    setState(null);
  };

  const dialog: ReactNode = state ? (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/10 text-brand">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <h2 className="mt-4 font-heading text-lg font-bold text-ink">{state.title}</h2>
        {state.description && <p className="mt-2 text-sm text-ink/60">{state.description}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => settle(false)}
            className="rounded-full border border-ink/15 px-5 py-2.5 text-xs font-semibold tracking-wider text-ink/70 uppercase transition-colors hover:bg-surface"
          >
            {state.cancelLabel ?? "Cancelar"}
          </button>
          <Button variant="solid" className="px-5 py-2.5" onClick={() => settle(true)}>
            {state.confirmLabel ?? "Eliminar"}
          </Button>
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, dialog };
}
