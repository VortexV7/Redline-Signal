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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://redline-signal.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Redline Signal",
    template: "%s | Redline Signal",
  },
  description:
    "Real-time global risk and sentiment intelligence dashboard powered by Reddit, HackerNews, and public X/Twitter feeds.",
  keywords: [
    "Redline Signal",
    "sentiment analysis",
    "risk intelligence",
    "OSINT dashboard",
    "FastAPI",
    "Next.js",
    "Leaflet",
    "global news map",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Redline Signal",
    title: "Redline Signal",
    description:
      "Live global sentiment and risk map from Reddit, HackerNews, and public X/Twitter signals.",
    images: [
      {
        url: "/og-image.svg?v=3",
        width: 1200,
        height: 630,
        alt: "Redline Signal dashboard preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Redline Signal",
    description:
      "Live global sentiment and risk map from Reddit, HackerNews, and public X/Twitter signals.",
    images: ["/og-image.svg?v=3"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg?v=3", type: "image/svg+xml", sizes: "any" },
      { url: "/icon.svg?v=3", type: "image/svg+xml", sizes: "any" },
    ],
    shortcut: ["/favicon.svg?v=3"],
    apple: ["/apple-icon.svg?v=3"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${robotoMono.variable} ${orbitron.variable} ${barcode.variable} ${gugi.variable}`}>
      <head>
        <link rel="icon" href="/favicon.svg?v=3" sizes="any" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.svg?v=3" type="image/svg+xml" />
        <meta property="og:image" content={`${siteUrl}/og-image.svg?v=3`} />
        <meta name="twitter:image" content={`${siteUrl}/og-image.svg?v=3`} />
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
