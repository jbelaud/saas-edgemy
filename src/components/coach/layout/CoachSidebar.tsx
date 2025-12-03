"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useSession, signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Megaphone,
  Calendar,
  CalendarCheck,
  Euro,
  Settings,
  Package,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  ArrowRightLeft,
  User,
  Users,
} from "lucide-react";

interface NavItem {
  titleKey: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    titleKey: "dashboard",
    href: "/coach/dashboard",
    icon: LayoutDashboard,
  },
  {
    titleKey: "announcements",
    href: "/coach/announcements",
    icon: Megaphone,
  },
  {
    titleKey: "packs",
    href: "/coach/packs",
    icon: Package,
  },
  {
    titleKey: "agenda",
    href: "/coach/agenda",
    icon: Calendar,
  },
  {
    titleKey: "sessions",
    href: "/coach/sessions",
    icon: CalendarCheck,
  },
  {
    titleKey: "revenue",
    href: "/coach/revenue",
    icon: Euro,
  },
  {
    titleKey: "settings",
    href: "/coach/settings",
    icon: Settings,
  },
];

export function CoachSidebar() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('coach.sidebar');
  // Ouvert sur desktop, fermé sur mobile
  const [collapsed, setCollapsed] = useState(false);
  const [coachSlug, setCoachSlug] = useState<string | null>(null);
  const [hasPlayerProfile, setHasPlayerProfile] = useState(false);
  const [coachAvatarUrl, setCoachAvatarUrl] = useState<string | null>(null);
  const { data: session } = useSession();

  // Détecter la taille de l'écran pour fermer sur mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) { // md breakpoint
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const user = session?.user;
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  // Récupérer le slug du coach et vérifier le profil joueur
  useEffect(() => {
    const fetchCoachSlug = async () => {
      try {
        const response = await fetch('/api/coach/profile');
        if (response.ok) {
          const data = await response.json();
          setCoachSlug(data.coach?.slug || null);
          setCoachAvatarUrl(data.coach?.avatarUrl || null);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du slug:', error);
      }
    };

    const checkPlayerProfile = async () => {
      try {
        const response = await fetch('/api/player/profile');
        setHasPlayerProfile(response.ok);
      } catch {
        setHasPlayerProfile(false);
      }
    };

    if (session?.user) {
      fetchCoachSlug();
      checkPlayerProfile();
    }
  }, [session]);

  return (
    <div
      className={cn(
        "relative flex flex-col border-r border-white/10 bg-slate-950 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header avec logo et toggle */}
      <div className="border-b border-white/10">
        {!collapsed ? (
          // Sidebar ouverte : logo et toggle sur la même ligne
          <div className="flex h-16 items-center justify-between px-3">
            <Link href={`/${locale}`} className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 font-bold text-slate-950 transform group-hover:scale-105 transition-transform">
                E
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Edgemy
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="h-8 w-8 flex-shrink-0 text-gray-400 hover:text-white hover:bg-white/5"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          // Sidebar fermée : logo en haut, toggle en dessous
          <div className="flex flex-col">
            <div className="flex h-16 items-center justify-center px-3">
              <Link href={`/${locale}`} className="flex items-center justify-center group">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 font-bold text-slate-950 transform group-hover:scale-105 transition-transform">
                  E
                </div>
              </Link>
            </div>
            <div className="flex justify-center pb-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(!collapsed)}
                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname.includes(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "text-gray-300 hover:bg-white/5 hover:text-white",
                collapsed && "justify-center"
              )}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0")} />
              {!collapsed && <span>{t(item.titleKey)}</span>}
              {!collapsed && item.badge && (
                <span className="ml-auto rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Profil utilisateur en bas */}
      <div className="border-t border-white/10 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-auto py-2 hover:bg-white/5 text-gray-300 hover:text-white",
                collapsed && "justify-center px-0"
              )}
            >
              <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-amber-500/20">
                <AvatarImage src={coachAvatarUrl || user?.image || ""} alt={user?.name || ""} />
                <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex flex-col items-start text-left overflow-hidden">
                  <p className="text-sm font-medium truncate w-full text-white">
                    {user?.name || t('user')}
                  </p>
                  <p className="text-xs text-gray-400 truncate w-full">
                    {user?.email || ""}
                  </p>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-slate-900/95 backdrop-blur-xl border-white/10" align="end" side="top">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-white">{user?.name}</p>
                <p className="text-xs leading-none text-gray-400">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem asChild>
              {hasPlayerProfile ? (
                <Link href={`/${locale}/player/dashboard`} className="flex items-center cursor-pointer text-gray-300 hover:text-white hover:bg-white/5 focus:bg-white/5 focus:text-white">
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  <span>{t('switchToPlayer')}</span>
                </Link>
              ) : (
                <Link href={`/${locale}/coach/${coachSlug}`} className="flex items-center cursor-pointer text-gray-300 hover:text-white hover:bg-white/5 focus:bg-white/5 focus:text-white">
                  <User className="mr-2 h-4 w-4" />
                  <span>{t('viewPublicProfile')}</span>
                </Link>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onClick={() => signOut({
                fetchOptions: {
                  onSuccess: () => {
                    window.location.href = `/${locale}`;
                  }
                }
              })}
              className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-300"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
