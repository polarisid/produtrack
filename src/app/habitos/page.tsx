"use client";

import * as React from "react";
import { Target, Flame, Calendar as CalIcon, Plus, CheckCircle2, ChevronRight, Sparkles, Brain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGTDStore } from "@/store/useGTDStore";
import { suggestSmartHabits, SmartHabitSuggestion } from "@/lib/gtd-ai";

export default function HabitosPage() {
  const { habits, toggleHabit, addHabit, tasks } = useGTDStore();
  
  const [isSuggesting, setIsSuggesting] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<SmartHabitSuggestion[]>([]);
  
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newTarget, setNewTarget] = React.useState("30");
  const [newColor, setNewColor] = React.useState("blue");

  const handleCreateHabit = () => {
    if (!newName.trim()) return;
    addHabit(newName.trim(), parseInt(newTarget) || 30, `text-${newColor}-500`, `bg-${newColor}-500/10`);
    setModalOpen(false);
    setNewName("");
    setNewTarget("30");
  };

  const handleSuggestHabits = async () => {
    if (isSuggesting) return;
    setIsSuggesting(true);
    try {
      const res = await suggestSmartHabits(tasks, habits);
      setSuggestions(res);
    } catch (e) {
      console.error(e);
      alert("Erro ao buscar sugestões inteligentes.");
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleAdoptHabit = (s: SmartHabitSuggestion) => {
    addHabit(s.name, s.target, `text-${s.color}-500`, `bg-${s.color}-500/10`);
    setSuggestions(prev => prev.filter(x => x.name !== s.name));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 mb-1">
            <Target className="h-8 w-8 text-primary" />
            Hábitos
          </h1>
          <p className="text-muted-foreground">
            A consistência é chave. Monitore e construa suas rotinas diárias.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Button 
            onClick={handleSuggestHabits} 
            variant="outline" 
            className="shadow-sm gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-900/50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
            disabled={isSuggesting}
          >
            {isSuggesting ? <Brain className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} 
            Smart Hábitos
          </Button>
          <Button onClick={() => setModalOpen(true)} className="shadow-sm gap-2">
            <Plus className="h-4 w-4" /> Novo Hábito
          </Button>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-6 animate-in slide-in-from-top-4 fade-in duration-500">
          <div className="flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400">
            <Brain className="h-5 w-5" />
            <h2 className="font-semibold text-lg">Sugestões de Copiloto</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((s, i) => (
              <div key={i} className="bg-white dark:bg-black/40 border rounded-xl p-4 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`p-1 rounded-md bg-${s.color}-500/10 text-${s.color}-500`}><Target className="w-3.5 h-3.5"/></span>
                    <h3 className="font-semibold text-sm">{s.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed italic mb-4">"{s.reason}"</p>
                </div>
                <Button onClick={() => handleAdoptHabit(s)} size="sm" variant="secondary" className={`w-full bg-${s.color}-50 dark:bg-${s.color}-950/20 text-${s.color}-600 dark:text-${s.color}-400 hover:bg-${s.color}-100 dark:hover:bg-${s.color}-900/40`}>
                  Adotar Hábito ({s.target} dias)
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {habits.map(habit => (
          <Card key={habit.id} className="border shadow-sm group">
            <CardContent className="p-0 flex items-stretch">
              {/* Check Handle */}
              <button 
                className={`w-16 flex items-center justify-center border-r transition-colors ${habit.doneToday ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                onClick={() => toggleHabit(habit.id)}
              >
                {habit.doneToday ? <CheckCircle2 className="h-6 w-6" /> : <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30" />}
              </button>
              
              <div className="flex-1 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="w-full md:w-auto flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-md ${habit.bg} ${habit.color}`}>
                      <Target className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-lg">{habit.name}</h3>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm mt-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span className="font-medium text-foreground">{habit.streak}</span> dias
                    </div>
                    <div className="w-px h-4 bg-border" />
                    <div className="flex-1 max-w-[150px]">
                      <div className="flex justify-between text-xs mb-1 text-muted-foreground">
                        <span>Progresso Meta</span>
                        <span>{Math.round((habit.streak / habit.target) * 100)}%</span>
                      </div>
                      <Progress value={(habit.streak / habit.target) * 100} className="h-1.5" />
                    </div>
                  </div>
                </div>

                {/* Histórico Mini Calendário */}
                <div className="hidden md:flex gap-1.5">
                  {[...Array(7)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-medium
                        ${i < 5 ? (habit.doneToday ? 'bg-primary text-primary-foreground' : 'bg-primary/20') : 'bg-muted text-muted-foreground'}
                      `}
                    >
                      {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'][i]}
                    </div>
                  ))}
                </div>

                <div className="hidden md:block">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Hábito</DialogTitle>
            <DialogDescription>
              Crie a rotina ou ação que você deseja monitorar diariamente.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome do Hábito</label>
              <Input 
                placeholder="Ex: Leitura 20 min" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)} 
                autoFocus 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Meta (Dias)</label>
                <Input 
                  type="number" 
                  value={newTarget} 
                  onChange={(e) => setNewTarget(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cor Base</label>
                <Select value={newColor} onValueChange={(val) => setNewColor(val || "blue")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Azul</SelectItem>
                    <SelectItem value="orange">Laranja</SelectItem>
                    <SelectItem value="green">Verde</SelectItem>
                    <SelectItem value="red">Vermelho</SelectItem>
                    <SelectItem value="purple">Roxo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateHabit} disabled={!newName.trim()}>Criar Hábito</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
