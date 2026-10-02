import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Heebo, Bungee } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Starfield from "@/components/Starfield";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-heebo",
});

const bungee = Bungee({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bungee",
});

export const metadata: Metadata = {
  title: "דן ידי זהב | DAN GOLD HANDS — פוקימון TCG, בוקסים אטומים ומכירות פומביות",
  description:
    "הבית של חובבי פוקימון TCG בישראל: בוסטר בוקסים אטומים, חבילות פוקימון ומכירות פומביות. מזמינים בלחיצה דרך וואטסאפ או SMS — דן דואג לכל השאר.",
  icons: { icon: "/images/logo.jpg" },
};

export const viewport: Viewport = {
  themeColor: "#06061a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${bungee.variable}`}>
      <body className="min-h-screen antialiased">
        <CartProvider>
          <Starfield />
          <div className="relative z-10 flex min-h-screen flex-col">
            <Nav />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <CartDrawer />
          <WhatsAppFloat />
        </CartProvider>
      </body>
    </html>
  );
}
