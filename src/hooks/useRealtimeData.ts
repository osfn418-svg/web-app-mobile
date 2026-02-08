import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type TableName = 'profiles' | 'ai_tools' | 'categories' | 'subscription_plans' | 'user_subscriptions' | 'chat_messages';

export function useRealtimeData<T>(
  tableName: TableName,
  initialFetch: () => Promise<T[]>,
  filter?: { column: string; value: string }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await initialFetch();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching data');
    } finally {
      setLoading(false);
    }
  }, [initialFetch]);

  useEffect(() => {
    fetchData();

    // Set up realtime subscription
    const channelName = filter 
      ? `${tableName}-${filter.column}-${filter.value}`
      : `${tableName}-all`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          ...(filter && { filter: `${filter.column}=eq.${filter.value}` }),
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          if (payload.eventType === 'INSERT') {
            setData(prev => [...prev, payload.new as T]);
          } else if (payload.eventType === 'UPDATE') {
            setData(prev => 
              prev.map(item => {
                const itemId = (item as Record<string, unknown>).id;
                const newId = (payload.new as Record<string, unknown>).id;
                return itemId === newId ? (payload.new as T) : item;
              })
            );
          } else if (payload.eventType === 'DELETE') {
            setData(prev => 
              prev.filter(item => {
                const itemId = (item as Record<string, unknown>).id;
                const oldId = (payload.old as Record<string, unknown>).id;
                return itemId !== oldId;
              })
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, filter?.column, filter?.value, fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Individual hooks for each table
export function useCategories() {
  return useRealtimeData('categories', async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('created_at');
    if (error) throw error;
    return data || [];
  });
}

export function useAITools() {
  return useRealtimeData('ai_tools', async () => {
    const { data, error } = await supabase
      .from('ai_tools')
      .select('*, categories(*)')
      .eq('is_active', true)
      .eq('is_approved', true)
      .order('rating', { ascending: false });
    if (error) throw error;
    return data || [];
  });
}

export function useSubscriptionPlans() {
  return useRealtimeData('subscription_plans', async () => {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price');
    if (error) throw error;
    return data || [];
  });
}

export function useAllProfiles() {
  return useRealtimeData('profiles', async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, user_roles(role), user_subscriptions(*, subscription_plans(*))')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  });
}

// Admin hooks - fetch all including inactive
export function useAdminTools() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: tools, error } = await supabase
      .from('ai_tools')
      .select('*, categories(*)')
      .order('created_at', { ascending: false });
    if (!error) setData(tools || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('admin-tools')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ai_tools' }, fetchData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
}

export function useAdminPlans() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price');
    if (!error) setData(plans || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('admin-plans')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscription_plans' }, fetchData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
}

export function useAdminCategories() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at');
    if (!error) setData(categories || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('admin-categories')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, fetchData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
}
