"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  CheckSquare, 
  Inbox, 
  LayoutDashboard, 
  CalendarDays, 
  FolderKanban,
  Target,
  Calendar,
  Plus,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useGTDStore } from "@/store/useGTDStore";
import { GTDModalsProvider } from "@/components/GTDModals";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Inbox", href: "/inbox", icon: Inbox },
  { name: "Tarefas", href: "/tarefas", icon: CheckSquare },
  { name: "Projetos", href: "/projetos", icon: FolderKanban },
  { name: "Calendário", href: "/calendario", icon: Calendar },
  { name: "Hábitos", href: "/habitos", icon: Target },
  { name: "Revisão", href: "/revisao", icon: CalendarDays },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const setCaptureModalOpen = useGTDStore(state => state.setCaptureModalOpen);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (pathname === '/login') {
    return <main className="min-h-screen bg-background">{children}</main>;
  }

  const userInitials = user?.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() ?? 'U';

  const userLabel = user?.displayName || user?.email || 'Usuário';

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <GTDModalsProvider />
      
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card/50 px-4 py-6">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CheckSquare className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">ProduTrack</span>
        </div>

        <Button 
          onClick={() => setCaptureModalOpen(true)}
          className="w-full justify-start gap-2 mb-8 shadow-sm" 
          size="lg"
        >
          <Plus className="h-5 w-5" />
          <span>Capturar</span>
        </Button>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <span
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-9 w-9 border shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium leading-none mb-1 truncate">{userLabel}</span>
                <span className="text-xs text-muted-foreground">Conta ativa</span>
              </div>
            </div>
            <ThemeToggle />
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-muted-foreground gap-2 hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto w-full pb-20 md:pb-0">
          <div className="mx-auto max-w-5xl px-4 py-6 md:p-8">
            {children}
          </div>
        </div>

        {/* Floating Action Button (Mobile) */}
        <div className="fixed bottom-24 right-4 md:hidden z-50">
          <Button 
            onClick={() => setCaptureModalOpen(true)}
            size="icon" 
            className="h-14 w-14 rounded-full shadow-lg"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </main>

      {/* Bottom Navigation Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-md z-40 pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 text-xs transition-colors",
                  isActive ? "text-primary font-medium" : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "fill-primary/20")} strokeWidth={isActive ? 2.5 : 2} />
                <span className="scale-90">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
