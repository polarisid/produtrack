"use client";

import { useEffect, useRef } from "react";
import { useGTDStore } from "@/store/useGTDStore";
import { generateProactiveReminder } from "@/lib/gtd-ai";

export function ProactiveAgent() {
  const { tasks } = useGTDStore();
  const checkingRef = useRef(false);

  useEffect(() => {
    // Solicitar permissão de notificação quando o componente montar
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const checkAndNotify = async () => {
      if (checkingRef.current) return;
      
      const now = new Date();
      const hour = now.getHours();
      
      // Lógica de horários limite
      // Vamos tentar notificar em janelas específicas se a pessoa não foi notificada hoje
      const timeOfDay = hour < 12 ? 'morning' : (hour < 18 ? 'afternoon' : 'evening');
      const todayStr = now.toISOString().split("T")[0];
      
      // Chave para evitar SPAM: prod_last_notify_{data}_{periodo}
      const storageKey = `prod_last_notify_${todayStr}_${timeOfDay}`;
      
      if (localStorage.getItem(storageKey)) {
        return; // Já notificou neste período!
      }

      // Evita fuzilar a API se estivermos dormindo
      if (hour < 8 || hour > 22) return;

      const pendingTasks = tasks.filter(t => t.status !== 'done');
      if (pendingTasks.length === 0) return; // Nenhuma tarefa? Não manda nada.

      if (Notification.permission === "granted") {
        checkingRef.current = true;
        try {
          const message = await generateProactiveReminder(pendingTasks, timeOfDay);
          
          if ("serviceWorker" in navigator) {
            const reg = await navigator.serviceWorker.ready;
            
            // Exibir notificação nativa (PWA Android / Win10)
            reg.showNotification("Copiloto ProduTrack", {
              body: message,
              icon: "/icon-512x512.png",
              vibrate: [200, 100, 200],
              tag: "proactive-reminder"
            } as any);
          } else {
            // Fallback para computadores que não usaram SW
            new Notification("Copiloto ProduTrack", { body: message });
          }
          
          localStorage.setItem(storageKey, "true");
        } catch (e) {
          console.error("Erro ao gerar notificação proativa", e);
        } finally {
          checkingRef.current = false;
        }
      }
    };

    // Executa uma vez no carregamento (com atraso para não atrapalhar o First Paint)
    const initialTimer = setTimeout(() => {
      checkAndNotify();
    }, 15000); // Checa 15 segundos depois de abrir o app

    // Executa a cada hora para garantir que vai pescar as janelas de tempo se a aba ficar aberta
    const interval = setInterval(() => {
      checkAndNotify();
    }, 60 * 60 * 1000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [tasks]);

  return null; // Este componente não renderiza nada visual! Ele é invisível.
}
