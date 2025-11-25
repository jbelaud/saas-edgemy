"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  CreditCard,
  FileText,
  Settings,
  Shield,
  TrendingUp,
  Star,
} from "lucide-react";

interface AdminSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const navigationItems = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Revenus",
    href: "/admin/revenue",
    icon: TrendingUp,
  },
  {
    name: "Utilisateurs",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Réservations",
    href: "/admin/sessions",
    icon: Calendar,
  },
  {
    name: "Modération Avis",
    href: "/admin/reviews",
    icon: Star,
  },
  {
    name: "Discord",
    href: "/admin/discord",
    icon: MessageSquare,
  },
  {
    name: "Paiements",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    name: "Logs Système",
    href: "/admin/logs",
    icon: FileText,
  },
  {
    name: "Paramètres",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  // Extraire la locale du pathname (ex: /fr/admin/dashboard -> fr)
  const locale = pathname.split('/')[1] || 'fr';

  return (
    <aside className="flex w-64 flex-col border-r border-white/10 bg-white/5 backdrop-blur-xl">
      {/* Logo & Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg shadow-purple-500/50">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Edgemy Admin</h1>
          <p className="text-xs text-gray-400">Panel d&apos;administration</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigationItems.map((item) => {
          const fullHref = `/${locale}${item.href}`;
          const isActive = pathname.includes(item.href);
          return (
            <Link
              key={item.href}
              href={fullHref}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-purple-500/20 text-white shadow-lg shadow-purple-500/20"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                  isActive && "text-purple-400"
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info Footer */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-semibold text-white">
            {user.name?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-white">
              {user.name || "Admin"}
            </p>
            <p className="truncate text-xs text-gray-400">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
