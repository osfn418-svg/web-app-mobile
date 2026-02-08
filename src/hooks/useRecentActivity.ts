import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RecentActivity {
  id: string;
  title: string;
  tool_name: string;
  tool_icon: string;
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
      // Fetch recent conversations
      const { data: conversations, error } = await supabase
        .from('chat_conversations')
        .select('id, title, tool_id, created_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Map tool_id to icons
      const toolIcons: Record<string, string> = {
        'ee7a12c4-d19f-4fb9-94f5-c66702b6e97c': '🤖',
      };

      const toolNames: Record<string, string> = {
        'ee7a12c4-d19f-4fb9-94f5-c66702b6e97c': 'الذكاء المساعد',
      };

      const recentActivities: RecentActivity[] = (conversations || []).map(conv => ({
        id: conv.id,
        title: conv.title || 'محادثة بدون عنوان',
        tool_name: toolNames[conv.tool_id] || 'أداة ذكية',
        tool_icon: toolIcons[conv.tool_id] || '💬',
        created_at: conv.created_at,
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
