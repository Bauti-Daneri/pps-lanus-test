import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Roboto_Slab } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "GranaBank",
  description: "Billetera del club",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${plusJakartaSans.variable} ${robotoSlab.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-surface-1 font-sans text-text-primary">
        {children}
      </body>
    </html>
  );
}
