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
  PanelLeftClose,
  PanelLeft,
  LogOut,
  ArrowRightLeft,
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
    title: "Paramètres",
    href: "/player/settings",
    icon: Settings,
  },
];

export function PlayerSidebar() {
  const pathname = usePathname();
  const locale = useLocale();
  const [collapsed, setCollapsed] = useState(false);
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
        setHasCoachProfile(response.ok);
      } catch (error) {
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
        "relative flex flex-col border-r bg-emerald-50/40 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header avec logo et toggle */}
      <div className="flex h-16 items-center justify-between border-b px-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {!collapsed && (
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold">
                E
              </div>
              <span className="text-xl font-bold">Edgemy</span>
            </Link>
          )}
          {collapsed && (
            <Link href={`/${locale}`} className="flex items-center justify-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold">
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
          className="h-8 w-8 flex-shrink-0"
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
          const isActive = pathname === `/${locale}${item.href}`;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-600 text-white"
                  : "text-gray-700 hover:bg-emerald-100",
                collapsed && "justify-center"
              )}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0")} />
              {!collapsed && <span>{item.title}</span>}
              {!collapsed && item.badge && (
                <span className="ml-auto rounded-full bg-emerald-600/10 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Profil utilisateur en bas */}
      <div className="border-t p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-auto py-2",
                collapsed && "justify-center px-0"
              )}
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex flex-col items-start text-left overflow-hidden">
                  <p className="text-sm font-medium truncate w-full">
                    {user?.name || "Utilisateur"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate w-full">
                    {user?.email || ""}
                  </p>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" side="top">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/${locale}/player/dashboard`} className="flex items-center cursor-pointer">
                <Home className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {hasCoachProfile && (
              <>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/coach/dashboard`} className="flex items-center cursor-pointer">
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    <span>Basculer en mode Coach</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              onClick={() => signOut()}
              className="cursor-pointer text-red-600"
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
