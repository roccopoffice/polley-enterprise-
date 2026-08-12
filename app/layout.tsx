import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileActionBar } from "@/components/MobileActionBar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export const metadata: Metadata = {
  title: "Polley Enterprise | Transportation, Hauling & Cleaning Services in Houston, TX",
  description:
    "Polley Enterprise provides vehicle transportation, freight hauling, trailer washouts, big rig cleaning, residential power washing, moving assistance, and personnel transportation across Texas.",
  keywords: [
    "Polley Enterprise",
    "Houston Texas trucking",
    "vehicle transport Houston",
    "freight hauling Texas",
    "trailer washout Houston",
    "power washing Houston",
    "semi truck cleaning",
    "moving services Houston",
    "personnel transportation Houston",
  ],
  openGraph: {
    title: "Polley Enterprise | Transportation, Hauling & Cleaning Services in Houston, TX",
    description:
      "Reliable transportation, hauling, washout, cleaning, power washing, moving, and personnel transportation services across Texas.",
    type: "website",
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${sora.variable} font-sans antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-enterprise-navy"
        >
          Skip to content
        </a>
        <Header />
        <main
          id="main-content"
          className="min-h-screen bg-white pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0"
        >
          {children}
        </main>
        <Footer />
        <MobileActionBar />
      </body>
    </html>
  );
}
