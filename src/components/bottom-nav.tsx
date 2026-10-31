"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { Icon } from "./icon";

// El Figma trae un SVG por estado (activo en granate, inactivo en gris).
const LINKS = [
  {
    href: "/home",
    label: "Inicio",
    icon: { width: 28, height: 28 },
    src: { active: "/icons/nav-home-active.svg", inactive: "/icons/nav-home.svg" },
  },
  {
    href: "/movimientos",
    label: "Movimientos",
    icon: { width: 20.8772, height: 23.3333 },
    src: {
      active: "/icons/nav-movements-active.svg",
      inactive: "/icons/nav-movements.svg",
    },
  },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 mx-auto flex h-[86px] w-full max-w-[414px] items-start justify-between rounded-t-3xl bg-surface-3 px-16 pb-[34px] pt-6 shadow-nav"
    >
      {LINKS.map(({ href, label, icon, src }) => {
        // También en subrutas: /movimientos/<id> marca Movimientos.
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? "page" : undefined}
          >
            <Icon
              src={active ? src.active : src.inactive}
              {...icon}
              box={28}
              // Según la página, un ícono de la barra puede ser el LCP.
              loading="eager"
            />
          </Link>
        );
      })}
      <form action={logout}>
        <button type="submit" aria-label="Salir" className="cursor-pointer">
          <Icon
            src="/icons/nav-logout.svg"
            width={23.3333}
            height={22.1667}
            box={28}
            loading="eager"
          />
        </button>
      </form>
    </nav>
  );
}
