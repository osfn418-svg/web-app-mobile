import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RecentActivity {
  id: string;
  title: string;
  tool_name: string;
  tool_icon: string;
  tool_url: string;
  created_at: string;
  type: 'chat' | 'generation';
}

export function useRecentActivity(limit: number = 5) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    if (!user) {
      setActivities([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch recent conversations + tool info
      const { data: conversations, error } = await supabase
        .from('chat_conversations')
        .select('id, title, tool_id, created_at, updated_at, ai_tools(name, logo_url, url)')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const recentActivities: RecentActivity[] = (conversations || []).map((conv: any) => ({
        id: conv.id,
        title: conv.title || 'محادثة بدون عنوان',
        tool_name: conv.ai_tools?.name || 'أداة ذكية',
        tool_icon: conv.ai_tools?.logo_url || '💬',
        tool_url: conv.ai_tools?.url || '/tools/assistant',
        created_at: conv.updated_at || conv.created_at,
        type: 'chat' as const,
      }));

      setActivities(recentActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  }, [user, limit]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return { activities, loading, refetch: fetchActivities };
}
