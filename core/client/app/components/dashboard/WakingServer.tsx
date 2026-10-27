"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Button from "@/app/components/ui/Button";
import { despertarServidor } from "@/app/lib/despertar";

// Shown by the dashboard layout when the backend didn't answer (it scales to
// zero when idle). Waits for it to wake up, then re-renders the dashboard
// with the same session instead of sending the user back to log in.
export default function WakingServer() {
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    void despertarServidor().then((ready) => {
      if (!active) return;
      if (ready) router.refresh();
      else setFailed(true);
    });
    return () => {
      active = false;
    };
  }, [router, attempt]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="flex max-w-sm flex-col items-center text-center">
        {failed ? (
          <>
            <h1 className="font-heading text-xl font-bold text-ink">El servidor no responde</h1>
            <p className="mt-2 text-sm text-ink/60">Intenta nuevamente en unos momentos.</p>
            <Button
              type="button"
              className="mt-6"
              onClick={() => {
                setFailed(false);
                setAttempt((n) => n + 1);
              }}
            >
              Reintentar
            </Button>
          </>
        ) : (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            <h1 className="mt-4 font-heading text-xl font-bold text-ink">Despertando el servidor</h1>
            <p className="mt-2 text-sm text-ink/60">
              El servidor estaba en reposo. Esto puede tardar hasta un minuto.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
