import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RestaurantProvider } from "@/context/RestaurantContext";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Bite POS",
  description: "A streamlined, browser-based Point of Sale system for restaurants",
  keywords: ["POS", "restaurant", "point of sale", "ordering system"],
  authors: [{ name: "Bite POS" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <RestaurantProvider>
          {children}
        </RestaurantProvider>
      </body>
    </html>
  );
}
