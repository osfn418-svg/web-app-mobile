import { motion } from 'framer-motion';
import { Search, Clock, Trash2, MessageSquare, Loader2 } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Conversation {
  id: string;
  title: string | null;
  tool_id: string;
  created_at: string;
  updated_at: string;
  ai_tools: {
    name: string;
    logo_url: string | null;
    url: string;
  } | null;
}

export default function SavedPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('id, title, tool_id, created_at, updated_at, ai_tools(name, logo_url, url)')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations((data as Conversation[]) || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [user]);

  const handleDelete = async (convId: string) => {
    setDeleting(convId);
    try {
      // Delete messages first
      await supabase.from('chat_messages').delete().eq('conversation_id', convId);
      // Then delete conversation
      const { error } = await supabase.from('chat_conversations').delete().eq('id', convId);
      if (error) throw error;

      setConversations(prev => prev.filter(c => c.id !== convId));
      toast.success('تم حذف المحادثة');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('حدث خطأ أثناء الحذف');
    } finally {
      setDeleting(null);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.ai_tools?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return date.toLocaleDateString('ar-SA');
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
          <p className="text-sm text-muted-foreground mb-4">
            جميع محادثاتك مع أدوات الذكاء الاصطناعي محفوظة هنا
          </p>
          
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

        {/* Conversations List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-muted-foreground">جاري التحميل...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                {searchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد سجلات حتى الآن'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                ابدأ باستخدام الأدوات لرؤية نشاطاتك هنا
              </p>
            </div>
          ) : (
            filteredConversations.map((conv, index) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl shrink-0">
                    {conv.ai_tools?.logo_url || '💬'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={conv.ai_tools?.url || '/home'}
                      className="block hover:opacity-80 transition-opacity"
                    >
                      <h3 className="font-medium text-foreground truncate">
                        {conv.title || 'محادثة بدون عنوان'}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {conv.ai_tools?.name || 'أداة'}
                      </p>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(conv.updated_at)}
                    </p>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button 
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                        disabled={deleting === conv.id}
                      >
                        {deleting === conv.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent dir="rtl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>حذف المحادثة</AlertDialogTitle>
                        <AlertDialogDescription>
                          هل أنت متأكد من حذف هذه المحادثة؟ لا يمكن التراجع عن هذا الإجراء.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(conv.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          حذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </MobileLayout>
  );
}
