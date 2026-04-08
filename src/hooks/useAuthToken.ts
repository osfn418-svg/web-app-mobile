import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to get the current user's access token for Edge Function calls.
 * Returns the JWT access_token, NOT the anon key.
 */
export function useAuthToken() {
  const getToken = useCallback(async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }, []);

  return { getToken };
}
