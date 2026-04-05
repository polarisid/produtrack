"use client";

import * as React from "react";
import { CalendarDays, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const REVIEW_STEPS = [
  { id: 1, title: "Esvaziar a mente", desc: "Coloque tudo que está solto no papel no seu Inbox." },
  { id: 2, title: "Zerar o Inbox", desc: "Processe tudo capturado e defina a próxima ação." },
  { id: 3, title: "Revisar Projetos", desc: "Certifique-se que cada projeto ativo tenha uma ação." },
  { id: 4, title: "Revisar Calendário", desc: "Revise a última semana e a próxima." },
  { id: 5, title: "Revisar 'Aguardando'", desc: "Cobre ou atualize os itens delegados." },
];

export default function RevisaoPage() {
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([]);

  const toggleStep = (id: number) => {
    setCompletedSteps(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
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
