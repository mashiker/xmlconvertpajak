import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coretax XML Converter — Konversi Excel/CSV ke XML DJP Coretax",
  description: "Alat konversi data Excel/CSV ke format XML DJP Coretax. Mendukung 25+ template SPT, Bukti Potong, Faktur Pajak, dan lainnya. 100% client-side, data aman di browser.",
  keywords: ["coretax", "djp", "xml converter", "bukti potong", "faktur pajak", "spt", "pph", "ppn", "pajak indonesia", "alatpajak"],
  authors: [{ name: "alatpajak.id" }],
  metadataBase: new URL("https://alatpajak.id"),
  alternates: {
    canonical: "https://alatpajak.id",
  },
  openGraph: {
    title: "Coretax XML Converter — All-in-One",
    description: "Konversi data Excel/CSV ke XML DJP Coretax dengan mudah. 25+ template, type-specific workflows, 100% client-side.",
    type: "website",
    url: "https://alatpajak.id",
    siteName: "alatpajak.id",
    locale: "id_ID",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0f0d] text-[#f0fdf4]`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
