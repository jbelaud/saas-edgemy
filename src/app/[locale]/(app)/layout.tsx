import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edgemy App - Plateforme de coaching poker",
  description: "Accédez à votre espace personnel Edgemy pour gérer vos sessions de coaching poker.",
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
