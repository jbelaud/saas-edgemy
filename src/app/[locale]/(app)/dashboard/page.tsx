'use client';

import { Users, Calendar, Shield, Settings, Loader2 } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { RoleSetupWrapper } from '@/components/auth/RoleSetupWrapper';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch('/api/user/role');
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.role);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du rôle:', error);
      } finally {
        setRoleLoading(false);
      }
    };

    if (session?.user) {
      fetchUserRole();
    }
  }, [session]);

  const getRoleLabel = (role: string | null) => {
    switch (role) {
      case 'COACH':
        return 'Coach';
      case 'PLAYER':
        return 'Joueur';
      case 'ADMIN':
        return 'Administrateur';
      case 'USER':
        return 'Utilisateur';
      default:
        return '-';
    }
  };

  const getRoleColor = (role: string | null) => {
    switch (role) {
      case 'COACH':
        return 'text-orange-600';
      case 'PLAYER':
        return 'text-blue-600';
      case 'ADMIN':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <RoleSetupWrapper />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto max-w-7xl px-6 py-6">
        {/* En-tête Dashboard */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            {session?.user ? (
              <>Bienvenue {session.user.name || session.user.email} !</>
            ) : (
              <>Bienvenue sur votre espace personnel Edgemy !</>
            )}
          </p>
        </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Sessions</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Prochaine session</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Shield className={`h-8 w-8 ${getRoleColor(userRole)}`} />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Rôle</p>
              {roleLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              ) : (
                <p className={`text-2xl font-bold ${getRoleColor(userRole)}`}>
                  {getRoleLabel(userRole)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Settings className="h-8 w-8 text-gray-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Statut</p>
              <p className="text-2xl font-bold text-gray-900">Actif</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section Sessions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Mes Sessions</h2>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune session programmée</p>
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Réserver une session
              </button>
            </div>
          </div>
        </div>

        {/* Section Coachs */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Coachs Disponibles</h2>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Découvrez nos coachs experts</p>
              <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Voir les coachs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message de développement */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Settings className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Version de développement
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Cette page est en cours de développement sur app.edgemy.fr. 
                Les fonctionnalités seront ajoutées progressivement.
              </p>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </>
  );
}
