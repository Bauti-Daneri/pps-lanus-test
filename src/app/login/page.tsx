import Image from "next/image";
import { LoginForm } from "./login-form";

// Fuera del grupo (app): sin barra de navegación.
export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[414px] flex-col gap-6 px-6 pb-6 pt-24">
      <header className="flex flex-col items-center gap-3 text-center">
        <Image src="/icons/escudo.svg" width={72} height={72} alt="" loading="eager" />
        <h1 className="text-[40px] leading-[1.25] font-bold text-granate">GranaBank</h1>
        <p className="text-body font-medium text-text-medium">
          Con cada compra, sumás orgullo granate
        </p>
      </header>
      <LoginForm />
    </main>
  );
}
