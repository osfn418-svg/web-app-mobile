import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Conversation {
  id: string;
  title: string | null;
  tool_id: string;
  created_at: string;
  updated_at: string;
}

export function useChatPersistence(toolId: string) {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [savedMessages, setSavedMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user's conversations for this tool
  const loadConversations = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('tool_id', toolId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, [user, toolId]);

  // Load messages for a specific conversation
  const loadMessages = useCallback(async (convId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const messages: Message[] = (data || []).map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));
      
      setSavedMessages(messages);
      setConversationId(convId);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, []);

  // Create a new conversation
  const createConversation = useCallback(async (firstMessage: string): Promise<string | null> => {
    if (!user) return null;

    try {
      // Generate title from first message (first 50 chars)
      const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');

      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: user.id,
          tool_id: toolId,
          title,
        })
        .select()
        .single();

      if (error) throw error;
      
      setConversationId(data.id);
      await loadConversations();
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  }, [user, toolId, loadConversations]);

  // Save a message to the database
  const saveMessage = useCallback(async (convId: string, role: 'user' | 'assistant', content: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: convId,
          role,
          content,
        });

      if (error) throw error;

      // Update conversation's updated_at
      await supabase
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', convId);

    } catch (error) {
      console.error('Error saving message:', error);
    }
  }, []);

  // Delete a conversation
  const deleteConversation = useCallback(async (convId: string) => {
    try {
      // Messages will be deleted due to cascade or we delete them first
      await supabase.from('chat_messages').delete().eq('conversation_id', convId);
      await supabase.from('chat_conversations').delete().eq('id', convId);
      
      if (conversationId === convId) {
        setConversationId(null);
        setSavedMessages([]);
      }
      
      await loadConversations();
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }, [conversationId, loadConversations]);

  // Start a new chat (reset state)
  const startNewChat = useCallback(() => {
    setConversationId(null);
    setSavedMessages([]);
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadConversations();
      setLoading(false);
    };
    
    if (user) {
      init();
    }
  }, [user, loadConversations]);

  return {
    conversationId,
    savedMessages,
    conversations,
    loading,
    createConversation,
    saveMessage,
    loadMessages,
    deleteConversation,
    startNewChat,
    loadConversations,
  };
}
