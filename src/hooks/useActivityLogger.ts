import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LogActivityParams {
  toolId: string;
  title: string;
  type?: 'generation' | 'chat';
}

export function useActivityLogger() {
  const { user } = useAuth();

  const logActivity = useCallback(async ({ toolId, title, type = 'generation' }: LogActivityParams) => {
    if (!user) return null;

    try {
      // Create a conversation record to log the activity
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: user.id,
          tool_id: toolId,
          title: title.slice(0, 100), // Limit title length
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error logging activity:', error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error('Error in logActivity:', error);
      return null;
    }
  }, [user]);

  return { logActivity };
}
