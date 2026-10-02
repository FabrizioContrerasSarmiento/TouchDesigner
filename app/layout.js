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

export const metadata = {
  title: "SECUENCIA — Muestra Audiovisual Interactiva",
  description:
    "Plataforma de reproducción y exhibición para obras generativas en TouchDesigner",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full bg-black text-white`}
    >
      <body className="h-full w-full bg-black text-zinc-100 antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}
