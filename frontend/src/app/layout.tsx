// src/app/layout.tsx
import type { Metadata } from "next";
import { Roboto_Mono, Orbitron, Libre_Barcode_39_Text, Gugi } from "next/font/google";
import "./globals.css";

const robotoMono = Roboto_Mono({
  subsets:  ["latin"],
  variable: "--font-mono",
  display:  "swap",
});

const orbitron = Orbitron({
  subsets:  ["latin"],
  variable: "--font-display",
  display:  "swap",
});

const barcode = Libre_Barcode_39_Text({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-barcode",
  display: "swap",
});

const gugi = Gugi({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-gugi",
  display: "swap",
});

export const metadata: Metadata = {
  title:       "INTERNET MOOD MAP",
  description: "Real-time global sentiment analysis powered by Reddit.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${robotoMono.variable} ${orbitron.variable} ${barcode.variable} ${gugi.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
      </head>
      <body className="bg-black text-white font-mono antialiased">
        {children}
      </body>
    </html>
  );
}
