import { motion } from 'framer-motion';
import { Search, Clock, Trash2 } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import { useState } from 'react';

export default function SavedPage() {
  const [searchQuery, setSearchQuery] = useState('');

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

        {/* Empty State */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">لا توجد سجلات حتى الآن</p>
            <p className="text-sm text-muted-foreground mt-1">
              ابدأ باستخدام الأدوات لرؤية نشاطاتك هنا
            </p>
          </div>
        </motion.div>
      </div>
    </MobileLayout>
  );
}
