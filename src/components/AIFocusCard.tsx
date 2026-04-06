'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Zap, Target, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGTDStore } from '@/store/useGTDStore';
import { generateDailyFocus, generateSmartAlerts, DailyFocusResult } from '@/lib/gtd-ai';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export function AIFocusCard() {
  const { tasks, habits, inbox } = useGTDStore();
  const [loading, setLoading] = useState(false);
  const [focusData, setFocusData] = useState<DailyFocusResult | null>(null);
  const [alerts, setAlerts] = useState<string[]>([]);

  const handleGenerateFocus = async () => {
    setLoading(true);
    try {
      const [focus, smartAlerts] = await Promise.all([
        generateDailyFocus(tasks, habits),
        generateSmartAlerts(tasks, inbox)
      ]);
      setFocusData(focus);
      setAlerts(smartAlerts);
    } catch (error) {
      console.error("Falha ao gerar foco de IA:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-indigo-500/20 shadow-lg shadow-indigo-500/5 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border-2 overflow-hidden">
      <CardHeader className="pb-3 border-b border-indigo-100 dark:border-indigo-900/50 bg-white/50 dark:bg-black/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
            <Brain className="w-5 h-5" />
            <CardTitle className="text-lg">Copiloto GTD</CardTitle>
          </div>
          {!focusData && !loading && (
            <Button 
              onClick={handleGenerateFocus} 
              size="sm" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              Gerar Foco do Dia
            </Button>
          )}
        </div>
        <CardDescription className="text-indigo-600/70 dark:text-indigo-400/70 font-medium">
          Dobre sua produtividade com análise inteligente da sua rotina.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-indigo-500 animate-spin" />
                <p className="text-sm text-indigo-600/80 dark:text-indigo-400">Analisando seu fluxo de trabalho...</p>
              </div>
              <Skeleton className="h-4 w-full bg-indigo-100 dark:bg-indigo-900/40" />
              <Skeleton className="h-4 w-3/4 bg-indigo-100 dark:bg-indigo-900/40" />
              <div className="pt-4 grid sm:grid-cols-2 gap-4">
                <Skeleton className="h-20 bg-indigo-50 dark:bg-indigo-950/20" />
                <Skeleton className="h-20 bg-indigo-50 dark:bg-indigo-950/20" />
              </div>
            </motion.div>
          ) : focusData ? (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-6 space-y-6"
            >
              <div>
                <p className="text-indigo-900 dark:text-indigo-100 text-[15px] leading-relaxed font-medium">
                  {focusData.summary}
                </p>
                {focusData.alert && (
                  <div className="mt-3 flex items-start gap-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 p-3 rounded-md border border-rose-200 dark:border-rose-500/20">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p className="text-sm font-medium">{focusData.alert}</p>
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-3 bg-white/60 dark:bg-black/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-semibold mb-2">
                    <Target className="w-4 h-4" />
                    <span>Prioridades Críticas</span>
                  </div>
                  {focusData.topPriorities.length > 0 ? (
                    <ul className="space-y-2">
                      {focusData.topPriorities.map((t, i) => (
                        <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                          <span className="text-indigo-500 mt-0.5">•</span> 
                          <span className="font-medium">{t}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500">Nenhuma prioridade crítica identificada.</p>
                  )}
                </div>

                <div className="space-y-3 bg-white/60 dark:bg-black/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold mb-2">
                    <Zap className="w-4 h-4" />
                    <span>Vitórias Rápidas (Quick Wins)</span>
                  </div>
                  {focusData.quickWins.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {focusData.quickWins.map((t, i) => (
                        <Badge key={i} variant="secondary" className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Sem vitórias rápidas no radar.</p>
                  )}
                </div>
              </div>
              
              {alerts.length > 0 && (
                <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5"/> Alertas Inteligentes</h4>
                  <ul className="space-y-2">
                    {alerts.map((alert, i) => (
                      <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                        {alert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
            </motion.div>
          ) : null}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
