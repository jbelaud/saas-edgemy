import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StructuredData } from "@/components/seo/StructuredData";
import { generateOrganizationSchema } from "@/lib/seo/structuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Edgemy – Coaching poker : trouvez votre coach idéal",
  description: "La plateforme qui connecte joueurs et coachs de poker. Trouvez le coach adapté à vos besoins pour progresser rapidement en MTT, cash game ou mental game.",
  keywords: "coaching poker, coach poker, formation poker, MTT, cash game, mental game, Discord poker, cours poker, plateforme coaching",
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
    title: "Edgemy – Coaching poker : trouvez votre coach idéal",
    description: "La plateforme qui connecte joueurs et coachs de poker pour progresser rapidement",
    siteName: "Edgemy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Edgemy – Coaching poker : trouvez votre coach idéal",
    description: "La plateforme qui connecte joueurs et coachs de poker pour progresser rapidement",
  },
};

// Données structurées de l'organisation Edgemy
const organizationSchema = generateOrganizationSchema({
  name: 'Edgemy',
  url: 'https://edgemy.fr',
  logo: 'https://edgemy.fr/logo.png',
  description: 'La plateforme qui connecte joueurs et coachs de poker. Trouvez le coach adapté à vos besoins pour progresser rapidement en MTT, cash game ou mental game.',
  sameAs: [
    // TODO: Ajouter les URLs réelles des réseaux sociaux Edgemy
    // Exemples :
    // 'https://twitter.com/edgemy',
    // 'https://www.linkedin.com/company/edgemy',
    // 'https://www.instagram.com/edgemy',
    // 'https://www.facebook.com/edgemy',
    // 'https://www.youtube.com/@edgemy',
  ],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <StructuredData data={organizationSchema} />
        {children}
      </body>
    </html>
  );
}
