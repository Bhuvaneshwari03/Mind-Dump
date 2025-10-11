import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient.js';

async function ensureUserInUsersTable(userId: string, email: string | null) {
  // Check if user exists in users table
  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId);

  if (checkError && checkError.code !== 'PGRST116') {
    console.error('Error checking users table:', checkError.message);
    return;
  }

  if (!existingUser) {
    const { error: insertError } = await supabase.from('users').insert({
      id: userId,
      email: email,
    });

    if (insertError) {
      console.error(
        'Error inserting user into users table:',
        insertError.message
      );
    } else {
      console.log('User added to users table');
    }
  }
}
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (data.user) {
        await ensureUserInUsersTable(data.user.id, data.user.email);
      }
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (data.user) {
        await ensureUserInUsersTable(data.user.id, data.user.email);
      }
      if (!error && rememberMe) {
        // Store remember me preference
        localStorage.setItem('minddump_remember_me', 'true');
      } else {
        localStorage.removeItem('minddump_remember_me');
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('minddump_remember_me');
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
