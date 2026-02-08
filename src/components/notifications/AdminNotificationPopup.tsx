import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
}

export function AdminNotificationPopup() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (user) {
      loadUnreadNotifications();
    }
  }, [user]);

  const loadUnreadNotifications = async () => {
    if (!user) return;

    try {
      // Get all active notifications from the secure public view (excludes created_by)
      const { data: allNotifications, error: notifError } = await supabase
        .from('public_notifications')
        .select('*')
        .eq('is_active', true)
        .or('expires_at.is.null,expires_at.gt.now()')
        .order('created_at', { ascending: false });

      if (notifError) throw notifError;

      // Get user's read notifications
      const { data: readNotifs } = await supabase
        .from('notification_reads')
        .select('notification_id')
        .eq('user_id', user.id);

      const readIds = new Set((readNotifs || []).map(r => r.notification_id));
      
      // Filter unread
      const unread = (allNotifications || []).filter(n => !readIds.has(n.id));
      
      if (unread.length > 0) {
        setNotifications(unread);
        setVisible(true);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('notification_reads')
        .insert({ notification_id: notificationId, user_id: user.id });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const dismissCurrent = async () => {
    const current = notifications[currentIndex];
    if (current) {
      await markAsRead(current.id);
    }

    if (currentIndex < notifications.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setVisible(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-6 h-6 text-warning" />;
      case 'success': return <CheckCircle className="w-6 h-6 text-success" />;
      case 'error': return <AlertCircle className="w-6 h-6 text-destructive" />;
      default: return <Info className="w-6 h-6 text-primary" />;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'warning': return 'border-warning/50 bg-warning/10';
      case 'success': return 'border-success/50 bg-success/10';
      case 'error': return 'border-destructive/50 bg-destructive/10';
      default: return 'border-primary/50 bg-primary/10';
    }
  };

  const current = notifications[currentIndex];

  if (!visible || !current) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={dismissCurrent}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-sm rounded-2xl border-2 p-5 ${getColors(current.type)}`}
          dir="rtl"
        >
          <div className="flex items-start gap-3">
            {getIcon(current.type)}
            <div className="flex-1">
              <h3 className="font-bold text-foreground">{current.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{current.message}</p>
            </div>
            <button
              onClick={dismissCurrent}
              className="p-1 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {notifications.length > 1 && (
            <div className="flex items-center justify-center gap-1 mt-4">
              {notifications.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === currentIndex ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          )}

          <button
            onClick={dismissCurrent}
            className="w-full mt-4 py-2 bg-foreground/10 hover:bg-foreground/20 rounded-xl text-foreground text-sm font-medium transition-colors"
          >
            {currentIndex < notifications.length - 1 ? 'التالي' : 'حسناً'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
