"use client";

import * as React from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Grid3x3,
  CalendarDays,
  CheckCircle2,
  Circle,
  Link2,
  Link2Off,
  Loader2,
  ExternalLink,
  Clock,
  PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGTDStore, Task } from "@/store/useGTDStore";
import { 
  format, 
  addMonths, 
  subMonths, 
  addWeeks, 
  subWeeks, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday,
  addDays,
  addHours,
  startOfDay,
  endOfDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  loadGoogleIdentityScript,
  requestCalendarAccess,
  fetchCalendarEvents,
  createCalendarEvent,
  getEventDateKey,
  getEventTime,
  type GoogleCalendarEvent,
} from "@/lib/googleCalendar";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getTaskDate(task: Task): Date | null {
  if (!task.dateStr || task.dateStr === 'Sem data' || task.dateStr === 'Próxima Semana') return null;
  if (task.dateStr === 'Hoje') return new Date();
  if (task.dateStr === 'Amanhã') return addDays(new Date(), 1);
  try {
    const parts = task.dateStr.split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
  } catch { /* ignore */ }
  return null;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CalendarioPage() {
  const { tasks, toggleTaskStatus, openTaskDetails } = useGTDStore();

  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [view, setView] = React.useState<"monthly" | "weekly">("monthly");

  // Google Calendar state
  const [googleToken, setGoogleToken] = React.useState<string | null>(null);
  const [googleEvents, setGoogleEvents] = React.useState<Map<string, GoogleCalendarEvent[]>>(new Map());
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const [googleError, setGoogleError] = React.useState<string | null>(null);
  const [gisReady, setGisReady] = React.useState(false);

  // Load Google Identity Services on mount
  React.useEffect(() => {
    loadGoogleIdentityScript().then(() => setGisReady(true));
  }, []);

  // Recompute day range
  const days = React.useMemo(() => {
    if (view === "monthly") {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(monthStart);
      return eachDayOfInterval({
        start: startOfWeek(monthStart, { weekStartsOn: 1 }),
        end: endOfWeek(monthEnd, { weekStartsOn: 1 }),
      });
    }
    return eachDayOfInterval({
      start: startOfWeek(currentDate, { weekStartsOn: 1 }),
      end: endOfWeek(currentDate, { weekStartsOn: 1 }),
    });
  }, [currentDate, view]);

  // Fetch Google events when token or range changes
  React.useEffect(() => {
    if (!googleToken || days.length === 0) return;

    const rangeStart = startOfDay(days[0]);
    const rangeEnd = endOfDay(days[days.length - 1]);

    setGoogleLoading(true);
    setGoogleError(null);

    fetchCalendarEvents(googleToken, rangeStart, rangeEnd)
      .then((events) => {
        const map = new Map<string, GoogleCalendarEvent[]>();
        events.forEach((ev) => {
          const key = getEventDateKey(ev);
          if (!map.has(key)) map.set(key, []);
          map.get(key)!.push(ev);
        });
        setGoogleEvents(map);
      })
      .catch((err) => {
        if (err.message === 'token_expired') {
          setGoogleToken(null);
          setGoogleError('Sessão do Google expirou. Reconecte.');
        } else {
          setGoogleError('Erro ao buscar eventos do Google Calendar.');
        }
      })
      .finally(() => setGoogleLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleToken, days]);

  // ProduTrack tasks by day
  const tasksByDay = React.useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach((task) => {
      const date = getTaskDate(task);
      if (date) {
        const key = format(date, 'yyyy-MM-dd');
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(task);
      }
    });
    return map;
  }, [tasks]);

  const handleConnectGoogle = () => {
    if (!gisReady) return;
    setGoogleError(null);
    requestCalendarAccess(
      (token) => {
        setGoogleToken(token);
        setGoogleError(null);
      },
      () => setGoogleError('Autorização cancelada ou falhou.')
    );
  };

  const handleDisconnect = () => {
    setGoogleToken(null);
    setGoogleEvents(new Map());
    setGoogleError(null);
  };

  const handleExportTask = async (task: Task) => {
    if (!googleToken) return;
    const date = getTaskDate(task);
    if (!date) return;
    const eventDate = new Date(date);
    eventDate.setHours(9, 0, 0, 0); // default 9 AM
    await createCalendarEvent(googleToken, task.title, eventDate, task.description);
    alert(`"${task.title}" enviado ao Google Calendar!`);
  };

  const next = () => view === "monthly" ? setCurrentDate(addMonths(currentDate, 1)) : setCurrentDate(addWeeks(currentDate, 1));
  const prev = () => view === "monthly" ? setCurrentDate(subMonths(currentDate, 1)) : setCurrentDate(subWeeks(currentDate, 1));
  const monthLabel = format(currentDate, "MMMM yyyy", { locale: ptBR });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-2.5 rounded-xl">
            <CalendarIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight capitalize">{monthLabel}</h1>
            <p className="text-muted-foreground text-sm">Seus prazos e compromissos.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          {/* Google Calendar button */}
          <div className="flex items-center gap-2">
            {!googleToken ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleConnectGoogle}
                disabled={!gisReady}
                className="gap-2 border-[#4285F4]/40 text-[#4285F4] hover:bg-[#4285F4]/10"
              >
                {gisReady ? <Link2 className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />}
                Conectar Google Calendar
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                {googleLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                <Badge variant="outline" className="gap-1.5 border-green-500/40 text-green-600 dark:text-green-400 text-xs py-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Google Calendar
                </Badge>
                <Button size="sm" variant="ghost" onClick={handleDisconnect} className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive">
                  <Link2Off className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-1 border">
            <Button variant="ghost" size="icon" onClick={prev} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())} className="h-8 font-medium">
              Hoje
            </Button>
            <Button variant="ghost" size="icon" onClick={next} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Tabs value={view} onValueChange={(v: any) => setView(v)} className="w-[180px]">
            <TabsList className="grid w-full grid-cols-2 h-10 p-1">
              <TabsTrigger value="monthly" className="text-xs flex items-center gap-1.5 h-8">
                <Grid3x3 className="h-3.5 w-3.5" /> Mês
              </TabsTrigger>
              <TabsTrigger value="weekly" className="text-xs flex items-center gap-1.5 h-8">
                <CalendarDays className="h-3.5 w-3.5" /> Semana
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Error banner */}
      {googleError && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2 animate-in fade-in">
          {googleError}
        </div>
      )}

      {/* Legend */}
      {googleToken && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-card border border-border" />
            Tarefas ProduTrack
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-[#4285F4]/80" />
            Google Calendar
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <Card className="border shadow-sm overflow-hidden bg-card/40 backdrop-blur-sm">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b bg-muted/20">
          {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map(day => (
            <div key={day} className="p-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.substring(0, 3)}</span>
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className={`grid grid-cols-7 bg-border/40 gap-px ${view === 'monthly' ? '' : 'h-[65vh]'}`}>
          {days.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayTasks = tasksByDay.get(dateKey) || [];
            const gEvents = googleEvents.get(dateKey) || [];
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isDayToday = isToday(day);

            return (
              <div
                key={dateKey}
                className={`flex flex-col bg-background min-h-[110px] transition-colors p-2
                  ${!isCurrentMonth && view === 'monthly' ? 'bg-muted/10 text-muted-foreground/50' : ''}
                  ${isDayToday ? 'ring-inset ring-2 ring-primary/40 bg-primary/5' : 'hover:bg-muted/20'}
                `}
              >
                {/* Day number */}
                <div className="flex justify-between items-center mb-1.5">
                  <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                    ${isDayToday ? 'bg-primary text-primary-foreground' : ''}
                  `}>
                    {format(day, 'd')}
                  </span>
                  {(dayTasks.length + gEvents.length) > 0 && (
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {dayTasks.length + gEvents.length}
                    </span>
                  )}
                </div>

                {/* Events */}
                <div className="flex-1 overflow-y-auto space-y-1 scrollbar-none">
                  {/* Google Calendar events */}
                  {gEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="group text-[11px] p-1.5 rounded-sm bg-[#4285F4]/15 border border-[#4285F4]/30 text-[#4285F4] dark:text-blue-300 flex items-start gap-1.5 cursor-default"
                      title={ev.summary}
                    >
                      <Clock className="h-3 w-3 shrink-0 mt-0.5 opacity-70" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium leading-none mb-0.5">{ev.summary}</div>
                        <div className="opacity-60 leading-none">{getEventTime(ev)}</div>
                      </div>
                      <a href={ev.htmlLink} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 shrink-0 mt-0.5 transition-opacity">
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  ))}

                  {/* ProduTrack tasks */}
                  {dayTasks.map((task) => {
                    const isDone = task.status === 'done';
                    return (
                      <div
                        key={task.id}
                        className={`group text-xs p-1.5 rounded border transition-colors cursor-pointer flex gap-1.5 items-start
                          ${isDone ? 'bg-muted/50 border-muted text-muted-foreground line-through' : 'bg-card border-border hover:border-primary/40'}
                          ${task.priority === 'high' && !isDone ? 'border-l-2 border-l-destructive/70' : ''}
                        `}
                        onClick={() => openTaskDetails(task.id)}
                        title={task.title}
                      >
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleTaskStatus(task.id); }}
                          className={`shrink-0 mt-0.5 transition-colors ${isDone ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                        >
                          {isDone ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                        </button>
                        <span className="truncate flex-1 leading-tight">{task.title}</span>
                        {/* Send to Google Calendar */}
                        {googleToken && !isDone && (
                          <button
                            type="button"
                            title="Enviar ao Google Calendar"
                            onClick={(e) => { e.stopPropagation(); handleExportTask(task); }}
                            className="opacity-0 group-hover:opacity-100 shrink-0 text-[#4285F4]/70 hover:text-[#4285F4] transition-all"
                          >
                            <PlusCircle className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
