import type { Metadata } from "next";
import { Libre_Baskerville, Manrope } from "next/font/google";
import "./globals.css";

const libre = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-display",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portal Fórmula Hogar",
  description: "Catálogo de oportunidades inmobiliarias para inversores",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    title: "Portal Fórmula Hogar",
    description: "Catálogo de oportunidades inmobiliarias para inversores",
    siteName: "Fórmula Hogar",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portal Fórmula Hogar",
    description: "Catálogo de oportunidades inmobiliarias para inversores",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${libre.variable} ${manrope.variable}`}>
      <body className="min-h-screen font-body">{children}</body>
    </html>
  );
}
