import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-6">
            <ShieldAlert className="h-16 w-16 text-red-600" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Accès refusé
          </h1>
          <p className="text-lg text-gray-600">
            Vous n&apos;avez pas la permission d&apos;accéder à cette section.
          </p>
        </div>

        <div className="space-y-4 pt-6">
          <p className="text-sm text-gray-500">
            Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur, veuillez contacter l&apos;administrateur.
          </p>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/app/dashboard">
                Retour au tableau de bord
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link href="/">
                Retour à l'accueil
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
