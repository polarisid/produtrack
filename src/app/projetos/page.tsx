"use client";

import * as React from "react";
import { FolderKanban, Plus, BarChart3, Clock, MoreVertical, CheckCircle2, Circle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useGTDStore } from "@/store/useGTDStore";

export default function ProjetosPage() {
  const { projects, tasks, toggleTaskStatus, setProjectModalOpen } = useGTDStore();
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const selectedProjectTasks = selectedProject ? tasks.filter(t => t.projectId === selectedProject.id) : [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 mb-1">
            <FolderKanban className="h-8 w-8 text-primary" />
            Projetos
          </h1>
          <p className="text-muted-foreground">
            Acompanhe o progresso dos seus resultados esperados que exigem mais de um passo.
          </p>
        </div>
        
        <Button className="w-full md:w-auto shadow-sm gap-2 mt-4 md:mt-0" onClick={() => setProjectModalOpen(true)}>
          <Plus className="h-4 w-4" /> Novo Projeto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map(project => {
          const projectTasks = tasks.filter(t => t.projectId === project.id);
          const completedTasks = projectTasks.filter(t => t.status === 'done').length;
          const tasksCount = projectTasks.length;
          const progress = tasksCount > 0 ? Math.round((completedTasks / tasksCount) * 100) : 0;
          
          return (
          <Card 
            key={project.id} 
            className="border shadow-sm flex flex-col justify-between group hover:border-primary/30 transition-colors cursor-pointer"
            onClick={() => setSelectedProjectId(project.id)}
          >
            <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${project.color}`} />
                  <h3 className="font-semibold text-lg leading-none">{project.name}</h3>
                </div>
                <Badge variant="secondary" className="text-[10px] font-normal uppercase tracking-wider mt-2">
                  {project.status}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground -mt-2 -mr-2">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 py-6">
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span>Progresso</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
            <CardFooter className="p-4 pt-0 text-sm text-muted-foreground flex justify-between items-center border-t border-border/50 mt-2 bg-muted/20">
              <div className="flex items-center gap-1.5 pt-3">
                <BarChart3 className="h-4 w-4" />
                <span>{tasksCount} tarefas</span>
              </div>
              <div className="flex items-center gap-1.5 pt-3">
                <Clock className="h-4 w-4" />
                <span>{project.dueDate}</span>
              </div>
            </CardFooter>
          </Card>
        )})}
      </div>

      <Dialog open={!!selectedProjectId} onOpenChange={(open) => !open && setSelectedProjectId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedProject && <div className={`w-3 h-3 rounded-full ${selectedProject.color}`} />}
              {selectedProject?.name}
            </DialogTitle>
            <DialogDescription>
              Tarefas contidas neste projeto.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2 max-h-[60vh] overflow-y-auto scrollbar-thin">
            {selectedProjectTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhuma tarefa associada a este projeto.</p>
            ) : (
              selectedProjectTasks.map(task => {
                const isDone = task.status === 'done';
                return (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <button onClick={() => toggleTaskStatus(task.id)} className="text-muted-foreground shrink-0 hover:text-primary transition-colors">
                        {isDone ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5" />}
                      </button>
                      <span className={`font-medium text-sm truncate ${isDone ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </span>
                    </div>
                    {task.dateStr && task.dateStr !== 'Sem data' && (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground font-normal shrink-0 uppercase ml-2">
                        {task.dateStr === 'Hoje' || task.dateStr === 'Amanhã' ? task.dateStr : 'Focado'}
                      </Badge>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
