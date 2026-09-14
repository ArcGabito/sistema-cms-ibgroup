"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sileo } from "sileo";
import { Eye, EyeOff, Lock, LogIn, User } from "lucide-react";
import Button from "@/app/components/ui/Button";
import { loginSchema, type LoginFormValues } from "@/app/lib/validations/auth";

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        sileo.error({
          title: "No se pudo ingresar",
          description: data?.message ?? "Usuario o contraseña incorrectos.",
        });
        return;
      }

      sileo.success({
        title: "Bienvenido",
        description: `Hola, ${data.user.fullName}.`,
      });
      router.push("/dashboard");
      router.refresh();
    } catch {
      sileo.error({
        title: "Error de conexión",
        description: "No pudimos conectar con el servidor. Intenta nuevamente.",
      });
    }
  };

  return (
    <div className="w-full max-w-lg">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white">
          <LogIn className="h-6 w-6" />
        </span>
        <h1 className="mt-5 font-heading text-2xl font-bold text-ink">Ingresa a tu panel</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink/60">
          Accede con tu usuario y contraseña para revisar el estado de tu proceso de outplacement.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5">
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold tracking-wider text-ink/50 uppercase">
            Usuario
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-ink/30" />
            <input
              type="text"
              autoComplete="username"
              placeholder="tu.usuario"
              className="w-full rounded-md border border-black/10 bg-white py-3 pr-4 pl-11 text-sm text-ink outline-none transition-colors focus:border-brand"
              {...register("usuario")}
            />
          </div>
          {errors.usuario && <p className="mt-1 text-xs text-brand">{errors.usuario.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-semibold tracking-wider text-ink/50 uppercase">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-ink/30" />
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-md border border-black/10 bg-white py-3 pr-11 pl-11 text-sm text-ink outline-none transition-colors focus:border-brand"
              {...register("contrasena")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute top-1/2 right-3.5 -translate-y-1/2 text-ink/30 hover:text-ink/60 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.contrasena && (
            <p className="mt-1 text-xs text-brand">{errors.contrasena.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
          {isSubmitting ? "Ingresando..." : "Ingresar"}
        </Button>
      </form>

      <p className="mt-8 text-center text-xs text-ink/50">
        ¿Aún no tienes acceso a tu panel?{" "}
        <Link href="/contactenos" className="font-semibold text-brand hover:text-brand-dark transition-colors">
          Contáctanos
        </Link>
      </p>
    </div>
  );
}
