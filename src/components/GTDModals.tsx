"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGTDStore } from "@/store/useGTDStore";
import { clarifyInboxItem, breakdownTask, unblockTask, UnblockResult, processBrainDump } from "@/lib/gtd-ai";
import { Sparkles, Brain, Zap } from "lucide-react";

export function CaptureModal() {
  const { isCaptureModalOpen, setCaptureModalOpen, addInboxItem } = useGTDStore();
  const [title, setTitle] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim()) return;
    addInboxItem(title.trim());
    setTitle("");
    setCaptureModalOpen(false);
  };

  const handleSmartDump = async () => {
    if (!title.trim()) return;
    setIsProcessing(true);
    try {
      const items = await processBrainDump(title);
      if (items && items.length > 0) {
        items.forEach(item => {
          if (item.trim()) addInboxItem(item.trim());
        });
        setTitle("");
        setCaptureModalOpen(false);
      } else {
        alert("A IA não conseguiu encontrar itens acionáveis no texto. Tente reescrever.");
      }
    } catch (e: any) {
      console.error("AI Dump Error:", e);
      alert("Erro ao extrair com IA: " + (e.message || "Tente novamente."));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isCaptureModalOpen} onOpenChange={setCaptureModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Despejo Mental (Captura)</DialogTitle>
          <DialogDescription>
            Jogue ideias, tarefas e rascunhos. Salve normalmente ou peça para a IA separar itens misturados na sua Caixa de Entrada.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Textarea
            autoFocus
            placeholder="O que está na sua mente? Ex:&#10;- Ligar para o cliente amanhã&#10;- Consertar o relatório de vendas..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="min-h-[120px] resize-y"
          />
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-2">
            <Button variant="outline" onClick={handleSave} disabled={!title.trim() || isProcessing} className="flex-1 sm:flex-none">
              Adicionar como 1 Item
            </Button>
            <Button onClick={handleSmartDump} disabled={!title.trim() || isProcessing} className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20">
              <Sparkles className={`w-4 h-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
              Extrair com IA
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ProcessModal() {
  const { isProcessModalOpen, closeProcessModal, processItemData, addTask, removeInboxItem, projects, contexts } = useGTDStore();
  
  const [context, setContext] = React.useState("@trabalho");
  const [priority, setPriority] = React.useState<"low" | "medium" | "high">("medium");
  const [projectId, setProjectId] = React.useState<string>("none");
  const [dateStr, setDateStr] = React.useState("Hoje");
  const [customDate, setCustomDate] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isClarifying, setIsClarifying] = React.useState(false);

  React.useEffect(() => {
    if (isProcessModalOpen) {
      setContext("@trabalho");
      setPriority("medium");
      setProjectId("none");
      setDateStr("Hoje");
      setCustomDate("");
      setDescription("");
      setIsClarifying(false);
    }
  }, [isProcessModalOpen]);

  if (!processItemData) return null;

  const handleProcess = () => {
    let finalDate = dateStr;
    if (finalDate === "custom") {
      if (!customDate) {
        finalDate = "Sem data";
      } else {
        const [y, m, d] = customDate.split("-");
        finalDate = (y && m && d) ? `${d}/${m}/${y}` : customDate;
      }
    }

    addTask({
      title: processItemData.title,
      context,
      priority,
      projectId: projectId === "none" ? undefined : projectId,
      dateStr: finalDate,
      description: description.trim() !== "" ? description.trim() : undefined
    });
    removeInboxItem(processItemData.id);
    closeProcessModal();
  };

  const handleClarify = async () => {
    setIsClarifying(true);
    try {
      const res = await clarifyInboxItem(processItemData.title);
      const tag = res.context;
      const tId = tag.startsWith('@') ? tag : `@${tag}`;
      if (!contexts.includes(tId)) {
        // we could add it dynamically, but for now we fallback
        setContext(contexts[0] || "@trabalho");
      } else {
         setContext(tId);
      }
      setPriority(res.priority);
      if (res.nextAction || res.type) {
        let desc = "";
        if (res.type && res.type !== "Task") desc += `[Sugerido pela IA como: ${res.type}]\n`;
        if (res.nextAction) desc += `Ação Sugerida: ${res.nextAction}`;
        setDescription(desc.trim());
      }
    } catch (e: any) {
      console.error("AI Error:", e);
      alert("Erro ao contatar a IA: " + (e.message || "Verifique o modelo e o console."));
    } finally {
      setIsClarifying(false);
    }
  };

  return (
    <Dialog open={isProcessModalOpen} onOpenChange={closeProcessModal}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Processar Item</DialogTitle>
          <div className="flex items-start gap-2 mt-2">
            <DialogDescription className="text-foreground font-medium text-base p-3 bg-muted rounded-lg border flex-1 break-words">
              {processItemData.title}
            </DialogDescription>
            <Button 
              size="icon" 
              disabled={isClarifying} 
              onClick={handleClarify} 
              className="h-[48px] w-[48px] shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 rounded-lg"
              title="Esclarecer com IA"
            >
              <Sparkles className={`w-5 h-5 ${isClarifying ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Contexto</label>
              <Select value={context} onValueChange={(val) => setContext(val || "")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {contexts.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Prazo</label>
              <Select value={dateStr} onValueChange={(val) => setDateStr(val || "")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hoje">Hoje</SelectItem>
                  <SelectItem value="Amanhã">Amanhã</SelectItem>
                  <SelectItem value="Próxima Semana">Próxima Semana</SelectItem>
                  <SelectItem value="Sem data">Sem data</SelectItem>
                  <SelectItem value="custom">Data exata</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Prioridade</label>
              <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Projeto (Opcional)</label>
              <Select value={projectId} onValueChange={(val) => setProjectId(val || "")}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {dateStr === "custom" && (
              <div className="col-span-2 space-y-2 animate-in fade-in zoom-in-95 duration-200">
                <label className="text-sm font-medium">Selecione a Data</label>
                <Input 
                  type="date" 
                  value={customDate} 
                  onChange={(e) => setCustomDate(e.target.value)} 
                  className="w-full"
                />
              </div>
            )}
            
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Descrição (Opcional)</label>
              <Textarea 
                placeholder="Detalhes ou anotações da tarefa..." 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="w-full min-h-[80px]"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button variant="outline" onClick={() => {
            removeInboxItem(processItemData.id);
            closeProcessModal();
          }}>
            Descartar Lixo
          </Button>
          <Button onClick={handleProcess}>Adicionar como Tarefa</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { Textarea } from "@/components/ui/textarea";
import { CheckSquare, Trash2, PlusCircle, CheckCircle2, Circle, AlignLeft, Tag, FolderKanban } from "lucide-react";

export function ProjectModal() {
  const { isProjectModalOpen, setProjectModalOpen, addProject } = useGTDStore();
  const [name, setName] = React.useState("");
  const [status, setStatus] = React.useState("Em Andamento");
  const [color, setColor] = React.useState("bg-blue-500");
  const [dueDate, setDueDate] = React.useState("");

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return;
    addProject({
      name: name.trim(),
      status,
      color,
      dueDate: dueDate ? new Date(dueDate).toLocaleDateString('pt-BR') : 'Sem data'
    });
    setName("");
    setDueDate("");
    setProjectModalOpen(false);
  };

  return (
    <Dialog open={isProjectModalOpen} onOpenChange={setProjectModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Projeto</DialogTitle>
          <DialogDescription>Crie um novo projeto para organizar suas tarefas.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome do Projeto</label>
            <Input placeholder="Ex: Lançar Site" value={name} onChange={e => setName(e.target.value)} autoFocus />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Limite (Opcional)</label>
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Cor e Status</label>
            <div className="grid grid-cols-2 gap-2">
              <Select value={color} onValueChange={(v) => setColor(v || "bg-blue-500")}>
                 <SelectTrigger><SelectValue /></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="bg-blue-500">Azul</SelectItem>
                   <SelectItem value="bg-red-500">Vermelho</SelectItem>
                   <SelectItem value="bg-green-500">Verde</SelectItem>
                   <SelectItem value="bg-purple-500">Roxo</SelectItem>
                   <SelectItem value="bg-orange-500">Laranja</SelectItem>
                 </SelectContent>
              </Select>
              <Select value={status} onValueChange={(v) => setStatus(v || "Em Andamento")}>
                 <SelectTrigger><SelectValue /></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="Planejamento">Planejamento</SelectItem>
                   <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                   <SelectItem value="Pausado">Pausado</SelectItem>
                 </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="mt-2" disabled={!name.trim()}>Criar Projeto</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TagsModal() {
  const { isTagsModalOpen, setTagsModalOpen, contexts, addContext, removeContext } = useGTDStore();
  const [newTag, setNewTag] = React.useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    const tag = newTag.trim().startsWith('@') ? newTag.trim() : `@${newTag.trim()}`;
    if (!contexts.includes(tag)) {
       addContext(tag);
    }
    setNewTag("");
  };

  return (
    <Dialog open={isTagsModalOpen} onOpenChange={setTagsModalOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Gerenciar Tags</DialogTitle>
          <DialogDescription>Adicione ou remova contextos e tags para suas tarefas.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input placeholder="Nova tag... (ex: @estudo)" value={newTag} onChange={e => setNewTag(e.target.value)} />
            <Button type="submit" variant="secondary">Adicionar</Button>
          </form>
          <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto scrollbar-thin">
             {contexts.map(ctx => (
               <div key={ctx} className="flex items-center justify-between p-2 rounded-md border text-sm">
                 <span className="font-medium">{ctx}</span>
                 <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeContext(ctx)}>
                   <Trash2 className="h-4 w-4" />
                 </Button>
               </div>
             ))}
             {contexts.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma tag cadastrada.</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function TaskDetailsModal() {
  const { 
    selectedTaskDetailsId, 
    closeTaskDetails, 
    tasks,
    projects,
    updateTaskStatus, 
    updateTaskProject,
    updateTaskDate,
    updateTaskDescription,
    addSubtask,
    toggleSubtask,
    removeSubtask
  } = useGTDStore();

  const task = tasks.find(t => t.id === selectedTaskDetailsId);
  const [newSubtask, setNewSubtask] = React.useState("");

  const [isBreaking, setIsBreaking] = React.useState(false);
  const [isUnblocking, setIsUnblocking] = React.useState(false);
  const [unblockRes, setUnblockRes] = React.useState<UnblockResult | null>(null);

  if (!task) return null;

  const handleBreakdown = async () => {
    setIsBreaking(true);
    try {
      const parts = await breakdownTask(task.title, task.description);
      parts.forEach(p => addSubtask(task.id, p));
    } catch (e) { console.error(e); }
    setIsBreaking(false);
  };

  const handleUnblock = async () => {
    setIsUnblocking(true);
    try {
      const res = await unblockTask(task.title, task.description);
      setUnblockRes(res);
    } catch (e) { console.error(e); }
    setIsUnblocking(false);
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    addSubtask(task.id, newSubtask.trim());
    setNewSubtask("");
  };

  const completedSubtasks = task.subtasks?.filter(s => s.done).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <Dialog open={!!selectedTaskDetailsId} onOpenChange={(open) => !open && closeTaskDetails()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-2">
          <div className="flex items-start gap-3 pr-6">
            <button 
              onClick={() => updateTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')}
              className="mt-1 shrink-0 text-muted-foreground hover:text-primary transition-colors"
            >
              {task.status === 'done' ? <CheckCircle2 className="h-6 w-6 text-primary" /> : <Circle className="h-6 w-6" />}
            </button>
            <DialogTitle className={`text-xl font-semibold leading-tight ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
              {task.title}
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="grid gap-6 py-2">
          
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-6 border-b border-border/50 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Status:</span>
              <Select value={task.status} onValueChange={(val: any) => updateTaskStatus(task.id, val)}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">A Fazer</SelectItem>
                  <SelectItem value="doing">Em Andamento</SelectItem>
                  <SelectItem value="done">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Projeto:</span>
              <Select value={task.projectId || "none"} onValueChange={(val) => updateTaskProject(task.id, val === "none" ? undefined : (val as string))}>
                <SelectTrigger className="w-[160px] h-8 text-xs">
                  <SelectValue placeholder="Sem projeto..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum projeto</SelectItem>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Prazo:</span>
              <Select 
                value={["Hoje", "Amanhã", "Próxima Semana", "Sem data"].includes(task.dateStr) ? task.dateStr : "custom"} 
                onValueChange={(val) => {
                  if (val !== "custom") updateTaskDate(task.id, val as string);
                  else {
                    updateTaskDate(task.id, !["Hoje", "Amanhã", "Próxima Semana", "Sem data"].includes(task.dateStr) ? task.dateStr : "Definir...");
                  }
                }}
              >
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Sem data" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hoje">Hoje</SelectItem>
                  <SelectItem value="Amanhã">Amanhã</SelectItem>
                  <SelectItem value="Próxima Semana">Próxima Semana</SelectItem>
                  <SelectItem value="Sem data">Sem data</SelectItem>
                  <SelectItem value="custom">Data exata</SelectItem>
                </SelectContent>
              </Select>
              
              {(!["Hoje", "Amanhã", "Próxima Semana", "Sem data"].includes(task.dateStr)) && (
                <Input 
                  placeholder="Ex: 25/12/2026"
                  className="w-[120px] h-8 text-xs animate-in fade-in zoom-in slide-in-from-left-2"
                  value={task.dateStr === "Definir..." ? "" : task.dateStr}
                  onChange={(e) => updateTaskDate(task.id, e.target.value)}
                  autoFocus
                />
              )}
            </div>
          </div>

          {/* Description area */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <AlignLeft className="h-4 w-4 text-muted-foreground" /> 
              Descrição
            </h4>
            <Textarea 
              placeholder="Adicione mais detalhes sobre a tarefa..."
              value={task.description || ""}
              onChange={(e) => updateTaskDescription(task.id, e.target.value)}
              className="min-h-[100px] resize-y"
            />
            {unblockRes && (
              <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 mt-2 animate-in fade-in slide-in-from-top-2">
                 <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-400 font-semibold">
                    <Brain className="w-4 h-4" /> Dica para Destravar
                 </div>
                 <p className="text-sm font-medium mb-1"><strong>Primeiro passo (5 min):</strong> {unblockRes.nextSimpleStep}</p>
                 <p className="text-xs text-muted-foreground mb-3">Tempo: {unblockRes.timeEstimate} | Energia: {unblockRes.energyLevel}</p>
                 <p className="text-sm text-indigo-800 dark:text-indigo-300 italic">"{unblockRes.advice}"</p>
                 <Button size="sm" variant="outline" className="mt-3 text-xs w-full" onClick={() => addSubtask(task.id, unblockRes.nextSimpleStep)}>Definir como Próximo Passo</Button>
              </div>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Button size="sm" variant="secondary" className="flex-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100" onClick={handleUnblock} disabled={isUnblocking}>
                <Zap className={`w-4 h-4 mr-2 ${isUnblocking ? 'animate-pulse' : ''}`} /> Desvendar Fluxo
              </Button>
              <Button size="sm" variant="secondary" className="flex-1 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 hover:bg-purple-100" onClick={handleBreakdown} disabled={isBreaking}>
                <Sparkles className={`w-4 h-4 mr-2 ${isBreaking ? 'animate-spin' : ''}`} /> Quebrar em Etapas
              </Button>
            </div>
          </div>

          {/* Subtasks area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-muted-foreground" /> 
                Subtarefas
              </h4>
              {totalSubtasks > 0 && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                  {completedSubtasks} / {totalSubtasks} ({Math.round(progress)}%)
                </span>
              )}
            </div>

            <div className="space-y-2">
              {task.subtasks?.map(subtask => (
                <div key={subtask.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                  <button 
                    onClick={() => toggleSubtask(task.id, subtask.id)}
                    className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {subtask.done ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4" />}
                  </button>
                  <span className={`text-sm flex-1 ${subtask.done ? 'line-through text-muted-foreground' : ''}`}>
                    {subtask.title}
                  </span>
                  <button 
                    onClick={() => removeSubtask(task.id, subtask.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddSubtask} className="flex items-center gap-2 mt-2">
              <Input 
                placeholder="Adicionar subtarefa..." 
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                className="h-9 text-sm"
              />
              <Button type="submit" size="sm" variant="secondary" className="px-3" disabled={!newSubtask.trim()}>
                <PlusCircle className="h-4 w-4" />
              </Button>
            </form>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}

import { OnboardingModal } from "@/components/OnboardingModal";

export function GTDModalsProvider() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <>
      <OnboardingModal />
      <CaptureModal />
      <ProcessModal />
      <TaskDetailsModal />
      <ProjectModal />
      <TagsModal />
    </>
  );
}
