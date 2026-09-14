import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { Toaster } from "sileo";
import "sileo/styles.css";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "IBOutplacement | Outplacement en Perú",
  description:
    "Programas de outplacement en Perú para ejecutivos y profesionales en transición laboral: coaching de empleabilidad, entrenamiento para entrevistas y acompañamiento personalizado.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${poppins.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-white text-ink">
        <Toaster position="top-right" theme="light" />
        {children}
      </body>
    </html>
  );
}
