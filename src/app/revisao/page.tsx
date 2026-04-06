"use client";

import * as React from "react";
import { CalendarDays, CheckCircle2, Circle, ArrowRight, Sparkles, Brain, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useGTDStore } from "@/store/useGTDStore";
import { generateWeeklyInsights, WeeklyInsightsResult } from "@/lib/gtd-ai";

const REVIEW_STEPS = [
  { id: 1, title: "Esvaziar a mente", desc: "Coloque tudo que está solto no papel no seu Inbox." },
  { id: 2, title: "Zerar o Inbox", desc: "Processe tudo capturado e defina a próxima ação." },
  { id: 3, title: "Revisar Projetos", desc: "Certifique-se que cada projeto ativo tenha uma ação." },
  { id: 4, title: "Revisar Calendário", desc: "Revise a última semana e a próxima." },
  { id: 5, title: "Revisar 'Aguardando'", desc: "Cobre ou atualize os itens delegados." },
];

export default function RevisaoPage() {
  const { tasks } = useGTDStore();
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([]);
  const [aiInsights, setAiInsights] = React.useState<WeeklyInsightsResult | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const toggleStep = (id: number) => {
    setCompletedSteps(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleGenerateInsights = async () => {
    setIsGenerating(true);
    try {
      const res = await generateWeeklyInsights(tasks);
      setAiInsights(res);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinalizar = () => {
    setCompletedSteps([]);
    // in a real app, this could also reset some "lastReviewDate" in the store.
  };

  const progressPercent = (completedSteps.length / REVIEW_STEPS.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="text-center space-y-3 mb-10">
        <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <CalendarDays className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Revisão Semanal</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          O segredo do GTD é manter seu sistema confiável. Tire este momento para se alinhar e preparar sua próxima semana.
        </p>
      </div>

      <Card className="border shadow-md bg-card/60 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle>Seu Progresso</CardTitle>
          <CardDescription>Conclua os passos para finalizar sua revisão</CardDescription>
          <div className="mt-4">
            <Progress value={progressPercent} className="h-2 w-full max-w-sm mx-auto transition-all duration-500 ease-in-out" />
            <p className="text-sm font-medium mt-3 text-muted-foreground">
              {completedSteps.length} de {REVIEW_STEPS.length} passos concluídos
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-4 border-t px-4 sm:px-8">
          {REVIEW_STEPS.map((step, idx) => {
            const isDone = completedSteps.includes(step.id);
            return (
              <div key={step.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border bg-background hover:border-primary/50 transition-all gap-4">
                <div className="flex items-start gap-4">
                  <button onClick={() => toggleStep(step.id)} className="mt-0.5 shrink-0 focus:outline-none transition-transform active:scale-95 cursor-pointer">
                    {isDone ? (
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground/30 hover:text-primary transition-colors" />
                    )}
                  </button>
                  <div>
                    <h4 className={`font-semibold transition-colors ${isDone ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      Passo {idx + 1}: {step.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
                
                {!isDone && (
                  <Button onClick={() => toggleStep(step.id)} variant="outline" size="sm" className="sm:w-auto w-full group">
                    Concluir 
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
      
      {/* SEÇÃO DE IA */}
      <Card className="border-indigo-500/20 shadow-md bg-gradient-to-br from-indigo-50/30 to-purple-50/30 dark:from-indigo-950/20 dark:to-purple-950/20 overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <Brain className="w-5 h-5" /> Retrospectiva Inteligente
              </CardTitle>
              <CardDescription>Deixe a engenharia de IA analisar sua semana e projetar a próxima.</CardDescription>
            </div>
            {!aiInsights && (
              <Button onClick={handleGenerateInsights} disabled={isGenerating} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Sparkles className={`w-4 h-4 mr-1.5 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Analisando...' : 'Gerar Análise'}
              </Button>
            )}
          </div>
        </CardHeader>
        {aiInsights && (
          <CardContent className="space-y-5">
            <p className="text-indigo-900 dark:text-indigo-100 font-medium text-[15px]">{aiInsights.summary}</p>
            
            <div className="grid sm:grid-cols-2 gap-4">
               {aiInsights.delayedTasks.length > 0 && (
                 <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                    <h5 className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-2">Tarefas Deslizando</h5>
                    <ul className="text-sm space-y-1">
                      {aiInsights.delayedTasks.map((t, i) => <li key={i} className="text-slate-600 dark:text-slate-400">-{t}</li>)}
                    </ul>
                 </div>
               )}
               {aiInsights.bottlenecks.length > 0 && (
                 <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                    <h5 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">Gargalos Identificados</h5>
                    <ul className="text-sm space-y-1">
                      {aiInsights.bottlenecks.map((t, i) => <li key={i} className="text-slate-600 dark:text-slate-400">-{t}</li>)}
                    </ul>
                 </div>
               )}
            </div>

            <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/50 space-y-3">
               <div>
                  <h5 className="text-sm font-semibold text-indigo-700 dark:text-indigo-400 mb-1">Ações de Melhoria Contínua</h5>
                  <ul className="text-sm space-y-1">
                    {aiInsights.actionableInsights.map((t, i) => <li key={i} className="text-slate-600 dark:text-slate-400">-{t}</li>)}
                  </ul>
               </div>
            </div>

            <div className="p-4 bg-indigo-600 dark:bg-indigo-900/50 rounded-lg text-white">
              <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-200 mb-1 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5"/> Foco Mestre da Próxima Semana:</h5>
              <p className="font-medium">{aiInsights.nextWeekFocus}</p>
            </div>
            
          </CardContent>
        )}
      </Card>

      <div className="text-center pt-4">
        <Button 
          size="lg" 
          className="px-8 transition-all duration-300 transform active:scale-95" 
          disabled={progressPercent < 100}
          onClick={handleFinalizar}
        >
          Finalizar Revisão
        </Button>
      </div>

    </div>
  );
}
