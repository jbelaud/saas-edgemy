import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

async function headers() {
  const { headers } = await import("next/headers");
  return headers();
}

export default async function DebugUserPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect(`/${locale}/auth/signin`);
  }

  // Récupérer l'utilisateur complet depuis la DB
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold">Debug User Info</h1>

        <div className="rounded-lg bg-gray-800 p-6">
          <h2 className="mb-4 text-xl font-semibold">Session Data (Better Auth)</h2>
          <pre className="overflow-auto rounded bg-gray-900 p-4 text-sm">
            {JSON.stringify(session.user, null, 2)}
          </pre>
        </div>

        <div className="rounded-lg bg-gray-800 p-6">
          <h2 className="mb-4 text-xl font-semibold">Database User</h2>
          <pre className="overflow-auto rounded bg-gray-900 p-4 text-sm">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        {user?.role !== "ADMIN" && (
          <form action={`/${locale}/debug-user/make-admin`} method="POST">
            <button
              type="submit"
              className="rounded-lg bg-purple-600 px-6 py-3 font-semibold hover:bg-purple-700"
            >
              Make me ADMIN
            </button>
          </form>
        )}

        {user?.role === "ADMIN" && (
          <div className="rounded-lg border-2 border-green-500 bg-green-500/10 p-4">
            <p className="text-green-400">✅ You are already an ADMIN!</p>
            <a
              href={`/${locale}/admin/dashboard`}
              className="mt-2 inline-block rounded-lg bg-purple-600 px-6 py-3 font-semibold hover:bg-purple-700"
            >
              Go to Admin Dashboard
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
