"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Circle, 
  Flame, 
  Target, 
  ArrowRight,
  TrendingUp,
  BrainCircuit
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useGTDStore } from "@/store/useGTDStore";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Dashboard() {
  const { tasks, habits, inbox, toggleTaskStatus, toggleHabit } = useGTDStore();
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  const tasksToday = tasks.filter(t => t.dateStr === "Hoje");
  const completedTasksCount = tasksToday.filter(t => t.status === 'done').length;
  const tasksProgress = tasksToday.length > 0 ? (completedTasksCount / tasksToday.length) * 100 : 0;

  const maxStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;
  const streakLabel = maxStreak > 0 ? `${maxStreak} Dias` : 'Sem streak';

  // Weekly load: percentage of all tasks (not "Sem data") that are done
  const scheduledTasks = tasks.filter(t => t.dateStr && t.dateStr !== 'Sem data');
  const doneTasks = scheduledTasks.filter(t => t.status === 'done');
  const weeklyLoad = scheduledTasks.length > 0 
    ? Math.round((doneTasks.length / scheduledTasks.length) * 100) 
    : 0;
  const weeklyLabel = weeklyLoad >= 80 ? 'Produtividade excelente' 
    : weeklyLoad >= 50 ? 'Bom progresso' 
    : weeklyLoad >= 20 ? 'Em andamento' 
    : scheduledTasks.length === 0 ? 'Adicione tarefas com prazo'
    : 'Precisa de atenção';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Greet */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Bom dia, Daniel</h1>
          <p className="text-muted-foreground capitalize">{today}</p>
        </div>
        <div className="flex items-center gap-4 bg-card border rounded-2xl px-4 py-2 shadow-sm">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500 fill-orange-500/20" />
            <span className="font-semibold text-sm">{streakLabel}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">Meta: {tasksToday.length}</span>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Tasks & GTD */}
        <div className="lg:col-span-2 space-y-6">
          
          <Card className="border-none shadow-md bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Foco de Hoje
                  </CardTitle>
                  <CardDescription>Suas prioridades para o dia</CardDescription>
                </div>
                <Badge variant="secondary" className="font-normal text-xs">
                  {completedTasksCount} de {tasksToday.length} concluídas
                </Badge>
              </div>
              <Progress value={tasksProgress} className="h-1.5 mt-4" />
            </CardHeader>
            <CardContent className="space-y-1">
              {tasksToday.map(task => {
                const isDone = task.status === 'done';
                return (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleTaskStatus(task.id)} className="text-muted-foreground hover:text-primary transition-colors">
                      {isDone ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>
                    <span className={isDone ? "line-through text-muted-foreground" : "font-medium text-sm"}>
                      {task.title}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase text-muted-foreground">
                    {task.context}
                  </Badge>
                </div>
              )})}
              {tasksToday.length === 0 && (
                <p className="text-sm text-muted-foreground p-3 text-center">Nenhuma tarefa extraída para hoje.</p>
              )}
              <Link href="/tarefas" className={buttonVariants({ variant: "ghost", className: "w-full mt-4 text-xs text-muted-foreground hover:text-primary" })}>
                Ver todas as tarefas <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border shadow-sm">
              <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Inbox</CardTitle>
                <BrainCircuit className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold">{inbox.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Itens aguardando processo
                </p>
                <Link href="/inbox" className={buttonVariants({ size: "sm", variant: "outline", className: "w-full mt-3 text-xs" })}>
                  Processar Inbox
                </Link>
              </CardContent>
            </Card>
            
            <Card className="border shadow-sm">
              <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Carga Semanal</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold">{weeklyLoad}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {weeklyLabel}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {doneTasks.length} de {scheduledTasks.length} tarefas com prazo concluídas
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column - Habits & Quick Access */}
        <div className="space-y-6">
          <Card className="border-none shadow-md bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Hábitos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {habits.map(habit => (
                <div key={habit.id} className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium leading-none mb-1.5">{habit.name}</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Flame className="h-3 w-3 text-orange-500 fill-orange-500/20" /> 
                      {habit.streak} dias
                    </span>
                  </div>
                  <Button 
                    onClick={() => toggleHabit(habit.id)}
                    size="icon" 
                    variant={habit.doneToday ? "default" : "outline"}
                    className="h-8 w-8 rounded-full"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground border-none">
            <CardHeader className="p-5">
              <CardTitle className="text-base font-semibold">Revisão Semanal</CardTitle>
              <CardDescription className="text-primary-foreground/80 text-xs mt-1">
                Sua revisão semanal está pendente. Esvazie a mente e prepare a próxima semana.
              </CardDescription>
              <Link href="/revisao" className={buttonVariants({ variant: "outline", size: "sm", className: "w-full mt-4 font-semibold text-sm border-white/50 text-white hover:bg-white/15 hover:text-white" })}>
                Iniciar Revisão
              </Link>
            </CardHeader>
          </Card>

        </div>
      </div>
    </div>
  );
}
