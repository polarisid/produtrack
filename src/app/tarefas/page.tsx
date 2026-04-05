"use client";

import * as React from "react";
import { CheckSquare, Calendar, Flag, MoreHorizontal, Grid2X2, List, AlignLeft, ListChecks } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useGTDStore, Task } from "@/store/useGTDStore";

export default function TarefasPage() {
  const { tasks, projects, toggleTaskStatus, openTaskDetails, updateTaskStatus } = useGTDStore();

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const doingTasks = tasks.filter(t => t.status === 'doing');
  const doneTasks = tasks.filter(t => t.status === 'done');

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <Tabs defaultValue="list" className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 mb-1">
              <CheckSquare className="h-8 w-8 text-primary" />
              Tarefas
            </h1>
            <p className="text-muted-foreground">
              Sua lista de próximas ações e pendências validadas.
            </p>
          </div>
          
          <TabsList className="grid w-full md:w-[240px] grid-cols-2">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" /> Lista
            </TabsTrigger>
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <Grid2X2 className="h-4 w-4" /> Kanban
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
          <Badge variant="default" className="px-3 py-1 cursor-pointer">Todas</Badge>
          <Badge variant="secondary" className="px-3 py-1 cursor-pointer">@trabalho</Badge>
          <Badge variant="secondary" className="px-3 py-1 cursor-pointer">@casa</Badge>
          <Badge variant="secondary" className="px-3 py-1 cursor-pointer">Alta Prioridade</Badge>
        </div>

        <TabsContent value="list" className="space-y-6 mt-0 border-none p-0 outline-none">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              Para Hoje
            </h3>
            <div className="grid gap-2">
              {tasks.filter(t => t.dateStr === "Hoje" && t.status !== 'done').map(task => (
                <TaskRow key={task.id} task={task} projects={projects} onToggle={() => toggleTaskStatus(task.id)} onClick={() => openTaskDetails(task.id)} />
              ))}
              {tasks.filter(t => t.dateStr === "Hoje" && t.status !== 'done').length === 0 && (
                <p className="text-sm text-muted-foreground italic py-2">Nenhuma tarefa pendente para hoje.</p>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
              <Calendar className="h-5 w-5 text-muted-foreground opacity-50" />
              Próximos Dias & Sem Data
            </h3>
            <div className="grid gap-2">
              {tasks.filter(t => t.dateStr !== "Hoje" && t.status !== 'done').map(task => (
                <TaskRow key={task.id} task={task} projects={projects} onToggle={() => toggleTaskStatus(task.id)} onClick={() => openTaskDetails(task.id)} />
              ))}
            </div>
          </div>

          {doneTasks.length > 0 && (
            <div className="space-y-3 pt-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2 text-muted-foreground">
                <CheckSquare className="h-5 w-5" />
                Concluídas Recentes
              </h3>
              <div className="grid gap-2 opacity-70">
                {doneTasks.slice(0, 5).map(task => (
                  <TaskRow key={task.id} task={task} projects={projects} onToggle={() => toggleTaskStatus(task.id)} onClick={() => openTaskDetails(task.id)} />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="kanban" className="mt-0 border-none p-0 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* TODO Column */}
            <div 
              className="flex flex-col gap-3 bg-muted/30 p-3 rounded-xl border border-muted min-h-[200px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const taskId = e.dataTransfer.getData("taskId");
                if (taskId) updateTaskStatus(taskId, 'todo');
              }}
            >
              <div className="flex items-center justify-between px-1 mb-1">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">A Fazer</h3>
                <Badge variant="secondary" className="px-1.5 min-w-[24px] flex justify-center">{todoTasks.length}</Badge>
              </div>
              {todoTasks.map(task => (
                <KanbanCard key={task.id} task={task} projects={projects} onClick={() => openTaskDetails(task.id)} />
              ))}
            </div>

            {/* DOING Column */}
            <div 
              className="flex flex-col gap-3 bg-primary/5 p-3 rounded-xl border border-primary/10 min-h-[200px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const taskId = e.dataTransfer.getData("taskId");
                if (taskId) updateTaskStatus(taskId, 'doing');
              }}
            >
              <div className="flex items-center justify-between px-1 mb-1">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-primary">Fazendo</h3>
                <Badge className="px-1.5 min-w-[24px] flex justify-center">{doingTasks.length}</Badge>
              </div>
              {doingTasks.map(task => (
                <KanbanCard key={task.id} task={task} projects={projects} onClick={() => openTaskDetails(task.id)} />
              ))}
            </div>

            {/* DONE Column */}
            <div 
              className="flex flex-col gap-3 bg-muted/10 p-3 rounded-xl border border-dashed border-border/60 min-h-[200px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const taskId = e.dataTransfer.getData("taskId");
                if (taskId) updateTaskStatus(taskId, 'done');
              }}
            >
              <div className="flex items-center justify-between px-1 mb-1">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground opacity-60">Concluído</h3>
                <Badge variant="outline" className="px-1.5 min-w-[24px] flex justify-center">{doneTasks.length}</Badge>
              </div>
              {doneTasks.map(task => (
                <KanbanCard key={task.id} task={task} projects={projects} onClick={() => openTaskDetails(task.id)} isDone />
              ))}
            </div>

          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}

function TaskRow({ task, projects, onToggle, onClick }: { task: Task, projects: any[], onToggle: () => void, onClick: () => void }) {
  const project = projects.find(p => p.id === task.projectId);
  const isDone = task.status === 'done';
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const completedSubtasks = task.subtasks?.filter(s => s.done).length || 0;

  return (
    <Card 
      onClick={onClick}
      className={`border shadow-sm hover:border-primary/40 transition-colors cursor-pointer group ${isDone ? 'bg-muted/40' : ''}`}
    >
      <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className={`mt-1 sm:mt-0 relative w-5 h-5 rounded border-2 cursor-pointer transition-colors flex items-center justify-center shrink-0
              ${isDone ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/40 hover:border-primary'}
            `}
          >
            {isDone && <CheckSquare className="h-3.5 w-3.5" />}
          </button>
          <div>
            <h4 className={`font-medium leading-none mb-1.5 transition-colors ${isDone ? 'text-muted-foreground line-through' : ''}`}>
              {task.title}
            </h4>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {project && (
                <span className="flex items-center gap-1 bg-secondary px-1.5 py-0.5 rounded text-[10px] font-semibold">
                  {project.name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Flag className={
                  task.priority === 'high' ? 'text-destructive h-3 w-3' :
                  task.priority === 'medium' ? 'text-orange-500 h-3 w-3' : 'text-blue-500 h-3 w-3'
                } />
              </span>
              <span>{task.context}</span>
              {task.dateStr !== 'Hoje' && task.dateStr !== 'Sem data' && (
                <span className="opacity-60">• {task.dateStr}</span>
              )}
              {task.description && <AlignLeft className="h-3 w-3 ml-1" />}
              {hasSubtasks && (
                <span className="flex items-center gap-1 ml-1 bg-muted px-1 rounded-sm">
                  <ListChecks className="h-3 w-3" /> {completedSubtasks}/{task.subtasks?.length}
                </span>
              )}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity absolute right-4">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

function KanbanCard({ task, projects, onClick, isDone = false }: { task: Task, projects: any[], onClick: () => void, isDone?: boolean }) {
  const project = projects.find(p => p.id === task.projectId);
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const completedSubtasks = task.subtasks?.filter(s => s.done).length || 0;

  return (
    <Card 
      draggable
      onDragStart={(e) => e.dataTransfer.setData("taskId", task.id)}
      onClick={onClick}
      className={`border shadow-sm hover:border-primary/40 focus:outline-none transition-colors cursor-grab active:cursor-grabbing group ${isDone ? 'opacity-60' : ''}`}
    >
      <CardHeader className="p-3 pb-2 flex flex-row items-start justify-between space-y-0">
        <h4 className={`text-sm font-medium leading-snug ${isDone ? 'line-through text-muted-foreground' : ''}`}>
          {task.title}
        </h4>
      </CardHeader>
      <CardContent className="p-3 pt-0 flex flex-col gap-2">
        {project && (
          <div className="inline-block mt-1">
            <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px] font-semibold text-muted-foreground">
              {project.name}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Flag className={
              task.priority === 'high' ? 'text-destructive h-3 w-3' :
              task.priority === 'medium' ? 'text-orange-500 h-3 w-3' : 'text-blue-500 h-3 w-3'
            } />
            {task.description && <AlignLeft className="h-3 w-3" />}
            {hasSubtasks && (
              <span className="flex items-center gap-1">
                <ListChecks className="h-3 w-3" /> {completedSubtasks}/{task.subtasks?.length}
              </span>
            )}
          </div>
          {task.dateStr !== 'Sem data' && (
            <span className="font-medium text-[10px] uppercase border p-0.5 px-1 rounded-sm">{task.dateStr}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
