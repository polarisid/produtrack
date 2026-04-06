"use client";

import * as React from "react";
import { 
  Inbox, 
  CheckSquare, 
  FolderKanban,
  Target, 
  CalendarDays,
  ArrowRight,
  Check,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGTDStore } from "@/store/useGTDStore";
import { useAuth } from "@/contexts/AuthContext";

const STEPS = [
  {
    icon: Sparkles,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    title: "Bem-vindo ao ProduTrack!",
    description: "Sua central pessoal de produtividade baseada no método GTD — Getting Things Done. Em 4 passos, veja como você vai conquistar clareza e foco total.",
    tip: null,
  },
  {
    icon: Inbox,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    title: "1. Capture tudo no Inbox",
    description: "Qualquer ideia, tarefa ou compromisso que surgir na sua cabeça — capture instantaneamente no Inbox. Sem pensar, sem organizar. Apenas registre e esvazie a mente.",
    tip: "Use o botão + Capturar ou o atalho no topo para adicionar itens em segundos.",
  },
  {
    icon: CheckSquare,
    color: "text-green-500",
    bg: "bg-green-500/10",
    title: "2. Processe e crie Tarefas",
    description: "Periodicamente revise o Inbox. Para cada item, decida: é acionável? Tem prazo? Pertence a que projeto? Ao processar, o item vira uma Tarefa organizada no sistema.",
    tip: "Clique em 'Processar' em cada item do Inbox para definiur contexto, prazo e prioridade.",
  },
  {
    icon: FolderKanban,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    title: "3. Organize em Projetos",
    description: "Projetos são resultados que exigem mais de uma ação. Agrupe suas tarefas relacionadas em projetos para ter visibilidade do progresso geral de cada iniciativa.",
    tip: "Na aba Tarefas, use o Kanban para arrastar cards entre 'A Fazer', 'Fazendo' e 'Concluído'.",
  },
  {
    icon: Target,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    title: "4. Construa Hábitos",
    description: "Além das tarefas pontuais, monitore rotinas diárias com o rastreador de Hábitos. Sequências (streaks) te motivam a manter consistência dia após dia.",
    tip: "Ao acordar, marque os hábitos do dia. Ao dormir, revise o que ficou pendente.",
  },
  {
    icon: CalendarDays,
    color: "text-primary",
    bg: "bg-primary/10",
    title: "Pronto para começar!",
    description: "Faça a Revisão Semanal toda semana para manter o sistema limpo e confiável. É o segredo do método GTD: um sistema que você confia liberta sua mente para o que importa.",
    tip: null,
  },
];

export function OnboardingModal() {
  const { hasSeenOnboarding, setOnboardingDone } = useGTDStore();
  const { user, isHydrated } = useAuth();
  const [step, setStep] = React.useState(0);
  const [animating, setAnimating] = React.useState(false);

  // Wait until Firestore data is loaded into the store before deciding to show
  if (!isHydrated || hasSeenOnboarding || !user) return null;

  const currentStep = STEPS[step];
  const Icon = currentStep.icon;
  const isLast = step === STEPS.length - 1;

  const next = () => {
    if (isLast) {
      setOnboardingDone();
      return;
    }
    setAnimating(true);
    setTimeout(() => {
      setStep(s => s + 1);
      setAnimating(false);
    }, 200);
  };

  const skip = () => setOnboardingDone();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className={`w-full max-w-lg bg-card border rounded-2xl shadow-2xl transition-all duration-200
          ${animating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
        `}
      >
        {/* Progress dots */}
        <div className="flex items-center gap-1.5 justify-center pt-6 pb-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 
                ${i === step ? 'w-6 bg-primary' : i < step ? 'w-4 bg-primary/40' : 'w-4 bg-muted'}
              `}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-8 text-center space-y-4">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${currentStep.bg} mx-auto mb-2`}>
            <Icon className={`h-8 w-8 ${currentStep.color}`} />
          </div>

          <h2 className="text-2xl font-bold tracking-tight">{currentStep.title}</h2>
          <p className="text-muted-foreground leading-relaxed">{currentStep.description}</p>

          {currentStep.tip && (
            <div className="flex items-start gap-3 text-left bg-muted/50 rounded-xl p-4 mt-4">
              <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">{currentStep.tip}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-8 pb-8 gap-4">
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={skip}>
            Pular tutorial
          </Button>
          
          <Button onClick={next} className="gap-2 px-6">
            {isLast ? (
              <>
                <Sparkles className="h-4 w-4" /> Começar agora!
              </>
            ) : (
              <>
                Próximo <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
