"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// A extensão de Typescript nativa não conhece o beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Detect mobile
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const handleBeforeInstallPrompt = (e: Event) => {
      // Previne que o Chrome puxe o mini-infobar automaticamente
      e.preventDefault();
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    
    // Se ele já instalou, oculta o evento de instalação com appinstalled
    window.addEventListener("appinstalled", () => {
      setIsInstallable(false);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPromptEvent) return;
    installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
    }
  };

  if (!isInstallable || !isMobile || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-50 animate-in slide-in-from-bottom-5 duration-500">
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-4 relative border border-indigo-700/50">
        <button 
          onClick={() => setIsDismissed(true)} 
          className="absolute -top-2 -right-2 bg-indigo-950 text-white border border-indigo-700 p-1.5 rounded-full hover:bg-slate-800"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="bg-indigo-600/30 p-2.5 rounded-xl border border-indigo-500/30">
          <Download className="h-6 w-6 text-indigo-300" />
        </div>
        <div className="flex-1 pr-2">
          <h4 className="font-semibold text-[15px] leading-tight">Instale o ProduTrack</h4>
          <p className="text-xs text-indigo-200 mt-0.5 leading-snug">Tenha acesso nativo, rápido e receba notificações direto no celular.</p>
        </div>
        <Button onClick={handleInstallClick} size="sm" className="bg-white text-indigo-950 hover:bg-indigo-50 shadow-md font-bold text-xs truncate shrink-0">
          Obter App
        </Button>
      </div>
    </div>
  );
}
