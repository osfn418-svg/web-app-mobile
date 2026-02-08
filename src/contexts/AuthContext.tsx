import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, authenticateUser, registerUser, initializeDatabase, db, getUserSubscription, getSubscriptionPlan } from '@/lib/database';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isPro: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { username: string; email: string; password: string; full_name: string }) => Promise<boolean>;
  logout: () => void;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);

  const checkSubscription = async (userId: number) => {
    const subscription = await getUserSubscription(userId);
    if (subscription) {
      const plan = await getSubscriptionPlan(subscription.plan_id);
      setIsPro(plan?.plan_name === 'Nexus Pro' || plan?.plan_name === 'للشركات');
    } else {
      setIsPro(false);
    }
  };

  const refreshSubscription = async () => {
    if (user?.user_id) {
      await checkSubscription(user.user_id);
    }
  };

  useEffect(() => {
    const init = async () => {
      await initializeDatabase();
      
      // Check for stored session
      const storedUserId = localStorage.getItem('nexus_user_id');
      if (storedUserId) {
        const userData = await db.users.get(parseInt(storedUserId));
        if (userData && userData.is_active) {
          setUser(userData);
          await checkSubscription(userData.user_id!);
        }
      }
      setIsLoading(false);
    };
    
    init();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const userData = await authenticateUser(email, password);
    if (userData) {
      setUser(userData);
      localStorage.setItem('nexus_user_id', String(userData.user_id));
      await checkSubscription(userData.user_id!);
      return true;
    }
    return false;
  };

  const register = async (data: { username: string; email: string; password: string; full_name: string }): Promise<boolean> => {
    try {
      const userId = await registerUser({
        username: data.username,
        email: data.email,
        password_hash: data.password,
        full_name: data.full_name,
      });
      
      const userData = await db.users.get(userId);
      if (userData) {
        setUser(userData);
        localStorage.setItem('nexus_user_id', String(userId));
        return true;
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsPro(false);
    localStorage.removeItem('nexus_user_id');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isPro, login, register, logout, refreshSubscription }}>
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
