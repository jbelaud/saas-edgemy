import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { AdminTopbar } from "@/components/admin/layout/AdminTopbar";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Vérifier l'authentification
  if (!session?.user) {
    redirect(`/${locale}/auth/signin`);
  }

  // Récupérer le rôle depuis la DB directement
  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  // Vérifier le rôle ADMIN
  if (user?.role !== "ADMIN") {
    redirect(`/${locale}/unauthorized`);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Sidebar fixe à gauche */}
      <AdminSidebar user={session.user} />

      {/* Contenu principal */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <AdminTopbar user={session.user} />

        {/* Zone de contenu avec scroll */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

async function headers() {
  const { headers } = await import("next/headers");
  return headers();
}
