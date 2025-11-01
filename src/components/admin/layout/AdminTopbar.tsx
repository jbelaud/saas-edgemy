"use client";

import { useState } from "react";
import { Moon, Sun, Bell, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface AdminTopbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function AdminTopbar({ user }: AdminTopbarProps) {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/fr");
        },
      },
    });
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/10 bg-white/5 px-6 backdrop-blur-xl">
      {/* Breadcrumb ou titre de page */}
      <div>
        <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Toggle Dark/Light Mode */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDark(!isDark)}
          className="rounded-xl text-gray-400 hover:bg-white/10 hover:text-white"
        >
          {isDark ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl text-gray-400 hover:bg-white/10 hover:text-white"
        >
          <Bell className="h-5 w-5" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative flex items-center gap-2 rounded-xl hover:bg-white/10"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image || undefined} alt={user.name || "Admin"} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-semibold text-white">
                  {user.name?.[0]?.toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-white/10">
            <div className="flex items-center gap-2 p-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.image || undefined} alt={user.name || "Admin"} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500">
                  {user.name?.[0]?.toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-white">{user.name || "Admin"}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer text-red-400 focus:text-red-300 focus:bg-red-500/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
