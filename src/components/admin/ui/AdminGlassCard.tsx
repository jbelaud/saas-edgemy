import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface AdminGlassCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  icon?: ReactNode;
}

export function AdminGlassCard({
  children,
  className,
  title,
  description,
  icon,
}: AdminGlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-md",
        className
      )}
    >
      {(title || description || icon) && (
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            {title && (
              <h3 className="text-xl font-semibold text-white">{title}</h3>
            )}
            {description && (
              <p className="mt-1 text-sm text-gray-400">{description}</p>
            )}
          </div>
          {icon && (
            <div className="ml-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
              {icon}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
