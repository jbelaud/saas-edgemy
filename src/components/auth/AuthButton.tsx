"use client";

import * as React from "react";
import { signIn, signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export function AuthButton() {
  const locale = useLocale();
  const t = useTranslations('header.auth');
  const { data: session, isPending } = useSession();
  const [coachData, setCoachData] = React.useState<{ avatarUrl?: string | null; isCoach?: boolean }>({});
  const [mounted, setMounted] = React.useState(false);

  // Éviter les erreurs d'hydratation en attendant le montage côté client
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Récupérer les données du coach si l'utilisateur est un coach
  React.useEffect(() => {
    if (session?.user) {
      fetch('/api/coach/profile')
        .then(res => res.json())
        .then(data => {
          if (data.coach) {
            setCoachData({ avatarUrl: data.coach.avatarUrl, isCoach: true });
          }
        })
        .catch(() => {
          setCoachData({});
        });
    }
  }, [session]);

  // Afficher un placeholder pendant le SSR et le chargement initial
  if (!mounted || isPending) {
    return (
      <Button variant="ghost" disabled className="h-10 w-10 rounded-full">
        <div className="h-10 w-10 rounded-full bg-gray-700 animate-pulse" />
      </Button>
    );
  }

  if (session?.user) {
    const user = session.user;
    const initials = user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

    // Utiliser l'avatar du coach en priorité, puis l'avatar du user
    const avatarUrl = coachData.avatarUrl || user.image;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/10 transition-all">
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatarUrl || undefined} alt={user.name || ""} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-64 p-0 bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl"
          align="end"
          forceMount
        >
          {/* Header avec GlassCard */}
          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={avatarUrl || undefined} alt={user.name || ""} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{user.name}</p>
                <p className="text-gray-400 text-sm truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="p-2">
            <DropdownMenuItem asChild>
              <Link
                href={coachData.isCoach ? `/${locale}/coach/dashboard` : `/${locale}/player/dashboard`}
                className="flex items-center gap-3 px-3 py-3 text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer group"
              >
                <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                  <LayoutDashboard className="h-4 w-4 text-blue-400" />
                </div>
                <span className="font-medium">{t('dashboard')}</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href={`/${locale}/player/settings`}
                className="flex items-center gap-3 px-3 py-3 text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer group"
              >
                <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                  <Settings className="h-4 w-4 text-purple-400" />
                </div>
                <span className="font-medium">{t('settings')}</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-white/10 my-2" />

            <DropdownMenuItem
              onClick={() => signOut()}
              className="flex items-center gap-3 px-3 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-all cursor-pointer group"
            >
              <div className="p-2 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-colors">
                <LogOut className="h-4 w-4 text-red-400 group-hover:text-red-300" />
              </div>
              <span className="font-medium">{t('logout')}</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      onClick={() =>
        signIn.social({
          provider: "google",
          callbackURL: `/${locale}/auth/callback`,
        })
      }
      className="bg-white text-gray-900 hover:bg-gray-100 border border-gray-300"
    >
      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      {t('loginWithGoogle')}
    </Button>
  );
}
