import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assigned_to: string;
  due_date: string;
  created_by: string;
}

interface TaskState {
  tasks: Task[];
  loading: boolean;
  fetchTasks: () => Promise<void>;
  createTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  loading: false,
  fetchTasks: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    set({ tasks: data || [], loading: false });
  },
  createTask: async (task) => {
    const { error } = await supabase.from('tasks').insert([task]);
    if (error) throw error;
  },
  updateTask: async (id, updates) => {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
  },
  deleteTask: async (id) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
}));