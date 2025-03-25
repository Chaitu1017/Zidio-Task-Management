import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role?: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  userRole: null,
  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      let role = null;
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();
        role = userData?.role;
      }

      set({ 
        user: session?.user ?? null,
        session,
        userRole: role,
        loading: false 
      });

      supabase.auth.onAuthStateChange(async (_event, session) => {
        let role = null;
        if (session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();
          role = userData?.role;
        }

        set({ 
          user: session?.user ?? null,
          session,
          userRole: role,
          loading: false 
        });
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ loading: false });
    }
  },
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle();

    set({ 
      user: data.user,
      session: data.session,
      userRole: userData?.role ?? null
    });
  },
  signUp: async (email, password, role = 'user') => {
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;

    if (data.user) {
      // Check if user already exists in users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle();

      if (!existingUser) {
        const { error: insertError } = await supabase
          .from('users')
          .insert([{ id: data.user.id, email, role }])
          .single();
        
        if (insertError) {
          // Rollback auth signup if user creation fails
          await supabase.auth.signOut();
          throw insertError;
        }
      }
    }

    set({ 
      user: data.user,
      session: data.session,
      userRole: role
    });
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ 
      user: null,
      session: null,
      userRole: null
    });
  },
}));