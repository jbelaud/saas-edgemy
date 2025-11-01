"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
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
  Home,
  Search,
  Users,
  Target,
  Settings,
  Calendar,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  ArrowRightLeft,
  UsersRound,
  Wallet,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    title: "Tableau de bord",
    href: "/player/dashboard",
    icon: Home,
  },
  {
    title: "Trouver un coach",
    href: "/player/coaches/explore",
    icon: Search,
  },
  {
    title: "Mes sessions",
    href: "/player/sessions",
    icon: Calendar,
  },
  {
    title: "Mes coachs",
    href: "/player/coaches",
    icon: Users,
  },
  {
    title: "Mes objectifs",
    href: "/player/goals",
    icon: Target,
  },
  {
    title: "Groupe de travail",
    href: "/player/workgroup",
    icon: UsersRound,
  },
  {
    title: "Bankroll",
    href: "/player/bankroll",
    icon: Wallet,
  },
  {
    title: "Paramètres",
    href: "/player/settings",
    icon: Settings,
  },
];

export function PlayerSidebar() {
  const pathname = usePathname();
  const locale = useLocale();
  const [collapsed, setCollapsed] = useState(true); // Collapsed par défaut sur mobile
  const [hasCoachProfile, setHasCoachProfile] = useState(false);
  const { data: session } = useSession();

  const user = session?.user;
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  // Vérifier le profil coach
  useEffect(() => {
    const checkCoachProfile = async () => {
      try {
        const response = await fetch('/api/coach/profile');
        if (response.ok) {
          const data = await response.json();
          setHasCoachProfile(!!data.coach);
        } else {
          setHasCoachProfile(false);
        }
      } catch {
        setHasCoachProfile(false);
      }
    };

    if (session?.user) {
      checkCoachProfile();
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
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {!collapsed && (
            <Link href={`/${locale}`} className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 font-bold text-slate-950 transform group-hover:scale-105 transition-transform">
                E
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Edgemy</span>
            </Link>
          )}
          {collapsed && (
            <Link href={`/${locale}`} className="flex items-center justify-center group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 font-bold text-slate-950 transform group-hover:scale-105 transition-transform">
                E
              </div>
            </Link>
          )}
        </div>
        
        {/* Toggle button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 flex-shrink-0 text-gray-400 hover:text-white hover:bg-white/5"
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          // Vérification exacte du chemin pour éviter les faux positifs
          // Par exemple, /player/coaches/explore ne doit pas activer /player/coaches
          const isActive = pathname === `/${locale}${item.href}` || 
                          (pathname.startsWith(`/${locale}${item.href}/`) && item.href !== '/player/coaches');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/20"
                  : "text-gray-300 hover:bg-white/5 hover:text-white",
                collapsed && "justify-center"
              )}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0")} />
              {!collapsed && <span>{item.title}</span>}
              {!collapsed && item.badge && (
                <span className="ml-auto rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">
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
              <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-emerald-500/20">
                <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex flex-col items-start text-left overflow-hidden">
                  <p className="text-sm font-medium truncate w-full text-white">
                    {user?.name || "Utilisateur"}
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
              <Link href={`/${locale}/player/dashboard`} className="flex items-center cursor-pointer text-gray-300 hover:text-white hover:bg-white/5 focus:bg-white/5 focus:text-white">
                <Home className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            {hasCoachProfile && (
              <>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/coach/dashboard`} className="flex items-center cursor-pointer text-gray-300 hover:text-white hover:bg-white/5 focus:bg-white/5 focus:text-white">
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    <span>Basculer en mode Coach</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
              </>
            )}
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
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
