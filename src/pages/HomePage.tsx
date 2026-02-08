import { motion } from 'framer-motion';
import { ChevronLeft, Clock, FileText, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import MobileLayout from '@/components/layout/MobileLayout';
import ToolCard from '@/components/cards/ToolCard';
import { useAuth } from '@/contexts/AuthContext';
import { useAITools, useCategories } from '@/hooks/useRealtimeData';
import { useState } from 'react';

export default function HomePage() {
  const { profile, isPro } = useAuth();
  const { data: tools, loading: toolsLoading } = useAITools();
  const { data: categories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredTools = selectedCategory === null 
    ? tools 
    : tools.filter(t => t.category_id === selectedCategory);

  return (
    <MobileLayout>
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-muted-foreground text-sm">مرحباً بك 👋</p>
            <h1 className="text-2xl font-bold text-foreground">
              {profile?.full_name || 'زائر'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              isPro 
                ? 'bg-gradient-pro text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {isPro ? 'PRO' : 'FREE'}
            </span>
          </div>
        </motion.div>

        {/* Pro Banner */}
        {!isPro && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Link to="/subscription">
              <div className="glass-card rounded-2xl p-5 neon-border relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="pro-badge">PRO</span>
                    <span className="text-sm text-foreground font-medium">أطلق العنان</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    للإبداع الكامل
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    وصول غير محدود لجميع نماذج التوليد الاحترافية
                  </p>
                  <div className="flex items-center gap-2 text-primary text-sm font-medium">
                    <span>اكتشف المزيد</span>
                    <ChevronLeft className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">الأدوات</h2>
            <Link to="/explore" className="text-sm text-primary">عرض الكل</Link>
          </div>
          
          {/* Filter tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedCategory === null
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              الكل
            </button>
            {categories.map((category: any) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>

          {/* Tools grid */}
          {toolsLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="glass-card rounded-xl p-4 h-32 animate-pulse bg-muted" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredTools.slice(0, 6).map((tool: any, index: number) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <ToolCard tool={{
                    tool_id: tool.id,
                    tool_name: tool.name,
                    tool_description: tool.description,
                    tool_url: tool.url,
                    logo_url: tool.logo_url,
                    requires_subscription: tool.requires_subscription,
                    rating: tool.rating,
                    category_id: 0,
                    added_by_admin: 0,
                    approved: true
                  }} />
                </motion.div>
              ))}
            </div>
          )}
          
          {filteredTools.length === 0 && !toolsLoading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">لا توجد أدوات في هذه الفئة</p>
            </div>
          )}
        </motion.div>

        {/* Recent Activity Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">النشاط الأخير</h2>
            <Link to="/saved" className="text-sm text-primary">عرض الكل</Link>
          </div>

          <div className="space-y-3">
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Video className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">ابدأ باستخدام الأدوات</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>جاهز للاستخدام</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </MobileLayout>
  );
}
