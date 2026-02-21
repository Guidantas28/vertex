"use client";

import { Bell, Search, Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app.store";

interface TopbarProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export function Topbar({ title, description, actions }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const { toggleSidebar } = useAppStore();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur px-6">
      {/* Mobile menu */}
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Title area */}
      <div className="flex-1 min-w-0">
        {title && (
          <div>
            <h1 className="text-sm font-semibold text-foreground truncate">
              {title}
            </h1>
            {description && (
              <p className="text-xs text-muted-foreground hidden sm:block">
                {description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="hidden md:block w-64">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            placeholder="Buscar leads, conversas..."
            className="h-8 w-full rounded-lg border border-input bg-background pl-8 pr-3 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Actions */}
      {actions}

      {/* Notifications */}
      <Button variant="ghost" size="icon-sm" className="relative">
        <Bell className="h-4 w-4" />
        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
      </Button>

      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
    </header>
  );
}
