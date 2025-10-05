import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Edgemy – Coaching poker personnalisé avec les meilleurs coachs francophones",
  description: "Trouvez le coach de poker qui fera passer votre jeu au niveau supérieur. Réservations faciles, sessions Discord privées, suivi personnalisé avec des pros de MTT et cash game.",
  keywords: "coaching poker, coach poker, formation poker, MTT, cash game, mental game, Discord poker, cours poker",
  authors: [{ name: "Edgemy" }],
  creator: "Edgemy",
  publisher: "Edgemy",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://edgemy.fr",
    title: "Edgemy – Coaching poker personnalisé",
    description: "Trouvez le coach de poker qui fera passer votre jeu au niveau supérieur",
    siteName: "Edgemy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Edgemy – Coaching poker personnalisé",
    description: "Trouvez le coach de poker qui fera passer votre jeu au niveau supérieur",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
