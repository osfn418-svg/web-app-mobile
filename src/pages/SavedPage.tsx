import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Clock, Trash2 } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ChatConversation, getChatHistory, db } from '@/lib/database';
import { toast } from 'sonner';

export default function SavedPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (user?.user_id) {
        const history = await getChatHistory(user.user_id);
        setConversations(history.reverse());
      }
    };
    loadData();
  }, [user]);

  const filteredConversations = conversations.filter(conv =>
    conv.user_message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.ai_response.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    await db.chat_conversations.delete(id);
    setConversations(prev => prev.filter(c => c.conversation_id !== id));
    toast.success('تم حذف المحادثة');
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'منذ لحظات';
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    return new Date(date).toLocaleDateString('ar');
  };

  return (
    <MobileLayout>
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-foreground mb-4">سجل النشاطات</h1>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث في السجلات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </motion.div>

        {/* Activity List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv, index) => (
              <motion.div
                key={conv.conversation_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
                className="glass-card rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl flex-shrink-0">
                    💬
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-medium truncate">
                      {conv.user_message.slice(0, 50)}...
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {conv.ai_response.slice(0, 80)}...
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(conv.created_at)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(conv.conversation_id!)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">لا توجد سجلات حتى الآن</p>
              <p className="text-sm text-muted-foreground mt-1">
                ابدأ باستخدام الأدوات لرؤية نشاطاتك هنا
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </MobileLayout>
  );
}
