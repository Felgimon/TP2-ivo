// Layout raíz de Next.js.
// Solo se encarga de: fonts globales, metadata y el shell de <html>/<body>.
// La página de PC builder usa `position: fixed` para ocupar toda la
// pantalla, así que no necesitamos flex column acá.

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PC Builder — Armá tu PC ideal",
  description:
    "Configurador 3D de PC: elegí cada componente y vé tu build cobrar forma en tiempo real.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-zinc-950 text-white">{children}</body>
    </html>
  );
}
