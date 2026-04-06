import { create } from 'zustand';

export type InboxItem = {
  id: string;
  title: string;
  createdAt: number;
};

export type TaskStatus = 'todo' | 'doing' | 'done';
export type Priority = 'low' | 'medium' | 'high';

export type Task = {
  id: string;
  title: string;
  projectId?: string;
  context: string;
  priority: Priority;
  status: TaskStatus;
  dateStr: string;
  description?: string;
  subtasks?: { id: string; title: string; done: boolean }[];
  createdAt: number;
};

export type Project = {
  id: string;
  name: string;
  status: string;
  color: string;
  dueDate: string;
};

export type Habit = {
  id: string;
  name: string;
  streak: number;
  target: number;
  doneToday: boolean;
  color: string;
  bg: string;
};

// The shape of data that gets persisted per user
export type PersistedData = {
  inbox: InboxItem[];
  tasks: Task[];
  projects: Project[];
  habits: Habit[];
  contexts: string[];
  hasSeenOnboarding: boolean;
};

type GTDState = PersistedData & {
  // Modal state (not persisted)
  isCaptureModalOpen: boolean;
  setCaptureModalOpen: (open: boolean) => void;

  isProcessModalOpen: boolean;
  processItemData: InboxItem | null;
  openProcessModal: (item: InboxItem) => void;
  closeProcessModal: () => void;
  
  isProjectModalOpen: boolean;
  setProjectModalOpen: (open: boolean) => void;

  isTagsModalOpen: boolean;
  setTagsModalOpen: (open: boolean) => void;

  selectedTaskDetailsId: string | null;
  openTaskDetails: (id: string) => void;
  closeTaskDetails: () => void;

  // Lifecycle actions
  hydrate: (data: Partial<PersistedData>) => void;
  resetToEmpty: () => void;
  setOnboardingDone: () => void;

  // Data actions
  addContext: (context: string) => void;
  removeContext: (context: string) => void;

  addInboxItem: (title: string) => void;
  removeInboxItem: (id: string) => void;

  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => void;
  toggleTaskStatus: (id: string) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  updateTaskProject: (id: string, projectId?: string) => void;
  updateTaskDescription: (id: string, description: string) => void;
  
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  removeSubtask: (taskId: string, subtaskId: string) => void;

  addProject: (project: Omit<Project, 'id'>) => void;

  toggleHabit: (id: string) => void;
  addHabit: (name: string, target: number, color: string, bg: string) => void;
};

const EMPTY_DATA: PersistedData = {
  inbox: [],
  tasks: [],
  projects: [],
  habits: [],
  contexts: ["@trabalho", "@casa", "@rua", "@computador"],
  hasSeenOnboarding: false,
};

export const useGTDStore = create<GTDState>((set) => ({
  ...EMPTY_DATA,

  isCaptureModalOpen: false,
  setCaptureModalOpen: (open) => set({ isCaptureModalOpen: open }),

  isProcessModalOpen: false,
  processItemData: null,
  openProcessModal: (item) => set({ isProcessModalOpen: true, processItemData: item }),
  closeProcessModal: () => set({ isProcessModalOpen: false, processItemData: null }),

  isProjectModalOpen: false,
  setProjectModalOpen: (open) => set({ isProjectModalOpen: open }),

  isTagsModalOpen: false,
  setTagsModalOpen: (open) => set({ isTagsModalOpen: open }),

  selectedTaskDetailsId: null,
  openTaskDetails: (id) => set({ selectedTaskDetailsId: id }),
  closeTaskDetails: () => set({ selectedTaskDetailsId: null }),

  hydrate: (data) => set((state) => ({ ...state, ...data })),
  resetToEmpty: () => set((state) => ({ ...state, ...EMPTY_DATA })),
  setOnboardingDone: () => set({ hasSeenOnboarding: true }),

  addContext: (context) => set((state) => ({
    contexts: state.contexts.includes(context) ? state.contexts : [...state.contexts, context]
  })),

  removeContext: (context) => set((state) => ({
    contexts: state.contexts.filter(c => c !== context)
  })),

  addInboxItem: (title) => set((state) => ({
    inbox: [{ id: Math.random().toString(36).substring(7), title, createdAt: Date.now() }, ...state.inbox]
  })),

  removeInboxItem: (id) => set((state) => ({
    inbox: state.inbox.filter(i => i.id !== id)
  })),

  addTask: (taskData) => set((state) => ({
    tasks: [{ ...taskData, id: Math.random().toString(36).substring(7), status: 'todo', createdAt: Date.now() }, ...state.tasks]
  })),

  toggleTaskStatus: (id) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t)
  })),

  updateTaskStatus: (id, status) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, status } : t)
  })),

  updateTaskProject: (id, projectId) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, projectId } : t)
  })),

  updateTaskDescription: (id, description) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, description } : t)
  })),

  addSubtask: (taskId, title) => set((state) => ({
    tasks: state.tasks.map(t => {
      if (t.id === taskId) {
        const newSubtask = { id: Math.random().toString(36).substring(7), title, done: false };
        return { ...t, subtasks: t.subtasks ? [...t.subtasks, newSubtask] : [newSubtask] };
      }
      return t;
    })
  })),

  toggleSubtask: (taskId, subtaskId) => set((state) => ({
    tasks: state.tasks.map(t => {
      if (t.id === taskId && t.subtasks) {
        return { ...t, subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, done: !s.done } : s) };
      }
      return t;
    })
  })),

  removeSubtask: (taskId, subtaskId) => set((state) => ({
    tasks: state.tasks.map(t => {
      if (t.id === taskId && t.subtasks) {
        return { ...t, subtasks: t.subtasks.filter(s => s.id !== subtaskId) };
      }
      return t;
    })
  })),

  addProject: (project) => set((state) => ({
    projects: [...state.projects, { ...project, id: Math.random().toString(36).substring(7) }]
  })),

  toggleHabit: (id) => set((state) => ({
    habits: state.habits.map(h => {
      if (h.id === id) {
        const isDone = !h.doneToday;
        return { ...h, doneToday: isDone, streak: isDone ? h.streak + 1 : Math.max(0, h.streak - 1) };
      }
      return h;
    })
  })),

  addHabit: (name, target, color, bg) => set((state) => ({
    habits: [...state.habits, {
      id: Math.random().toString(36).substring(7),
      name, streak: 0, target, doneToday: false, color, bg
    }]
  })),
}));

// Fields that should be saved/loaded per user
const PERSISTED_KEYS: (keyof PersistedData)[] = ['inbox', 'tasks', 'projects', 'habits', 'contexts', 'hasSeenOnboarding'];

export function getUserStorageKey(uid: string) {
  return `gtd-data-${uid}`;
}

export function loadUserData(uid: string): Partial<PersistedData> | null {
  try {
    const raw = localStorage.getItem(getUserStorageKey(uid));
    if (!raw) return null;
    return JSON.parse(raw) as Partial<PersistedData>;
  } catch {
    return null;
  }
}

export function saveUserData(uid: string, state: GTDState) {
  try {
    const toSave: Partial<PersistedData> = {};
    PERSISTED_KEYS.forEach(k => {
      (toSave as any)[k] = (state as any)[k];
    });
    localStorage.setItem(getUserStorageKey(uid), JSON.stringify(toSave));
  } catch {
    // ignore storage errors
  }
}
