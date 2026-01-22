import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster as Sonner } from "sonner";
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
  title: "Sarvaa Sweets - Premium Tamil Nadu Traditional Sweets",
  description: "Authentic Tamil Nadu sweets handcrafted with pure ghee and traditional recipes. Order Mysore Pak, Tirunelveli Halwa, Palgova, and more.",
  keywords: ["Tamil Nadu sweets", "Mysore Pak", "Tirunelveli Halwa", "Indian sweets", "mithai", "Chennai sweets", "traditional sweets"],
  authors: [{ name: "Sarvaa Sweets" }],
  openGraph: {
    title: "Sarvaa Sweets - தமிழ்நாட்டின் #1 இனிப்பு கடை",
    description: "Authentic Tamil Nadu sweets with pure ghee and traditional recipes",
    siteName: "Sarvaa Sweets",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sarvaa Sweets - Premium Tamil Nadu Sweets",
    description: "Handcrafted traditional sweets from Tamil Nadu",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <Header />
        {children}
        <Footer />
        <Toaster />
        <Sonner position="top-right" />
      </body>
    </html>
  );
}
