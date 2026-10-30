"use client";

import { useActionState, useState } from "react";
import { login } from "@/app/actions/auth";
import { Icon } from "@/components/icon";

const ERROR_ID = "login-error";

// Borde según el estado (no por variantes de CSS), así el rojo de error no
// compite con el granate del foco.
function fieldBorder(invalid: boolean) {
  return invalid ? "border-danger" : "border-border-2 focus-within:border-granate";
}

const FIELD = "rounded-xl border bg-surface-3 px-3.5 py-2";
const INPUT =
  "w-full min-w-0 bg-transparent font-display text-body text-text-primary outline-none placeholder:text-text-medium";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const [showPassword, setShowPassword] = useState(false);
  const invalid = Boolean(state?.error);
  const errorProps = invalid
    ? { "aria-invalid": true, "aria-describedby": ERROR_ID }
    : {};

  return (
    <form action={action} className="flex flex-1 flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-body font-semibold">
          Email
        </label>
        <div className={`${FIELD} ${fieldBorder(invalid)}`}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            placeholder="nombre@correo.com"
            className={INPUT}
            {...errorProps}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-body font-semibold">
          Contraseña
        </label>
        <div className={`${FIELD} ${fieldBorder(invalid)} flex items-center gap-1.5`}>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="Tu contraseña"
            className={INPUT}
            {...errorProps}
          />
          {/* Etiqueta fija + aria-pressed: es un botón que alterna. */}
          <button
            type="button"
            aria-label="Mostrar contraseña"
            aria-pressed={showPassword}
            onClick={() => setShowPassword((visible) => !visible)}
            className="shrink-0 cursor-pointer"
          >
            <Icon
              src={showPassword ? "/icons/visibility.svg" : "/icons/visibility-off.svg"}
              width={18}
              height={18}
              box={18}
            />
          </button>
        </div>
      </div>

      {state?.error && (
        <p id={ERROR_ID} role="alert" className="text-body font-semibold text-danger">
          {state.error}
        </p>
      )}

      {/* Solo visual por ahora: la action login no lee "remember". */}
      <label className="flex cursor-pointer items-center gap-2 self-start">
        <span className="relative flex size-5 shrink-0">
          <input
            type="checkbox"
            name="remember"
            className="peer size-5 cursor-pointer appearance-none rounded-md border border-border-2 bg-surface-3 checked:border-granate checked:bg-granate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-granate"
          />
          {/* Tilde blanca: no está en el Figma (solo dice "granate al marcar"). */}
          <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden peer-checked:block"
          >
            <path
              d="M5.5 10.5l3 3 6-7"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="font-display text-body font-normal">Recordarme</span>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="mt-auto h-10 w-full cursor-pointer rounded-full bg-granate px-8 font-display text-body font-normal text-white disabled:cursor-default disabled:opacity-50"
      >
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
