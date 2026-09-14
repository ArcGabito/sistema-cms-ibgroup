"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { sileo } from "sileo";
import Button from "@/app/components/ui/Button";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/ingresar");
      router.refresh();
    } catch {
      sileo.error({
        title: "No se pudo cerrar sesión",
        description: "Inténtalo nuevamente.",
      });
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleLogout} disabled={loading} className="gap-2">
      <LogOut className="h-4 w-4" />
      {loading ? "Saliendo..." : "Cerrar sesión"}
    </Button>
  );
}
