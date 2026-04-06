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
  LogOut,
  Zap
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
  { name: "Dashboard",  href: "/",          icon: LayoutDashboard },
  { name: "Inbox",      href: "/inbox",      icon: Inbox },
  { name: "Tarefas",    href: "/tarefas",    icon: CheckSquare },
  { name: "Projetos",   href: "/projetos",   icon: FolderKanban },
  { name: "Calendário", href: "/calendario", icon: Calendar },
  { name: "Hábitos",    href: "/habitos",    icon: Target },
  { name: "Revisão",    href: "/revisao",    icon: CalendarDays },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const setCaptureModalOpen = useGTDStore(state => state.setCaptureModalOpen);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 rounded-xl bg-primary/20 animate-ping" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              <Zap className="h-5 w-5" />
            </div>
          </div>
          <span className="text-sm text-muted-foreground font-medium tracking-wide">Carregando…</span>
        </div>
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
      
      {/* ── Sidebar Desktop ─────────────────────────── */}
      <aside className="hidden md:flex w-60 flex-col border-r border-border/60 bg-sidebar px-3 py-5 shrink-0">
        
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-7 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/40">
            <Zap className="h-4 w-4" />
          </div>
          <span className="text-[17px] font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            ProduTrack
          </span>
        </div>

        {/* Capture Button */}
        <Button 
          onClick={() => setCaptureModalOpen(true)}
          className="w-full justify-start gap-2 mb-6 shadow-sm shadow-primary/20 font-semibold" 
          size="default"
        >
          <Plus className="h-4 w-4" />
          Capturar
        </Button>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <span
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground/70"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {item.name}

                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="mt-auto pt-4 border-t border-border/60 space-y-1">
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="h-8 w-8 shrink-0 ring-2 ring-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-semibold leading-tight truncate">{userLabel}</span>
                <span className="text-[11px] text-muted-foreground">Conta ativa</span>
              </div>
            </div>
            <ThemeToggle />
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-muted-foreground gap-2 hover:text-destructive hover:bg-destructive/10 text-[13px]"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────── */}
      <main className="flex-1 relative flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto w-full pb-20 md:pb-0">
          <div className="mx-auto max-w-5xl px-4 py-6 md:p-8">
            {children}
          </div>
        </div>

        {/* FAB Mobile */}
        <div className="fixed bottom-24 right-4 md:hidden z-50">
          <Button 
            onClick={() => setCaptureModalOpen(true)}
            size="icon" 
            className="h-14 w-14 rounded-full shadow-xl shadow-primary/30"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </main>

      {/* ── Bottom Navigation Mobile ──────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border/60 bg-background/90 backdrop-blur-xl z-40 pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full gap-1 text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon
                  className={cn("h-5 w-5 transition-all", isActive && "scale-110")}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

