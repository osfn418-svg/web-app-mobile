import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  is_banned: boolean;
  ban_reason: string | null;
  created_at: string;
}

interface UserRole {
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isPro: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; password: string; username: string; full_name: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPro, setIsPro] = useState(false);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) throw profileError;
      
      if (profileData) {
        setProfile(profileData as Profile);
        
        // Check if user is banned
        if (profileData.is_banned) {
          await supabase.auth.signOut();
          toast.error('تم حظر حسابك. السبب: ' + (profileData.ban_reason || 'غير محدد'));
          return;
        }
      }

      // Check user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      const roles = roleData as UserRole[] | null;
      setIsAdmin(roles?.some(r => r.role === 'admin') || false);

      // Check subscription
      const { data: subscriptionData } = await supabase
        .from('user_subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString())
        .maybeSingle();

      setIsPro(!!subscriptionData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(() => {
            fetchProfile(currentSession.user.id);
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
          setIsPro(false);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      
      if (existingSession?.user) {
        fetchProfile(existingSession.user.id);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        await fetchProfile(data.user.id);
        return { success: true };
      }

      return { success: false, error: 'خطأ غير متوقع' };
    } catch (error) {
      return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' };
    }
  };

  const register = async (data: { email: string; password: string; username: string; full_name: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            username: data.username,
            full_name: data.full_name,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (authData.user) {
        toast.success('تم إنشاء الحساب! يرجى التحقق من بريدك الإلكتروني.');
        return { success: true };
      }

      return { success: false, error: 'خطأ غير متوقع' };
    } catch (error) {
      return { success: false, error: 'حدث خطأ أثناء التسجيل' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    setIsAdmin(false);
    setIsPro(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      session, 
      isLoading, 
      isAdmin, 
      isPro, 
      login, 
      register, 
      logout,
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
