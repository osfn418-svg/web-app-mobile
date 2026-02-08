-- Allow users to delete their own messages
CREATE POLICY "Users can delete messages in own conversations"
ON public.chat_messages
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM chat_conversations
    WHERE chat_conversations.id = chat_messages.conversation_id
    AND chat_conversations.user_id = auth.uid()
  )
);