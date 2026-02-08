import { motion } from 'framer-motion';
import { ChevronLeft, Clock, MessageCircle, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import MobileLayout from '@/components/layout/MobileLayout';
import ToolCard from '@/components/cards/ToolCard';
import { useAuth } from '@/contexts/AuthContext';
import { useAITools, useCategories } from '@/hooks/useRealtimeData';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import { useState } from 'react';

export default function HomePage() {
  const { profile, isPro } = useAuth();
  const { data: tools, loading: toolsLoading } = useAITools();
  const { data: categories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { activities, loading: activitiesLoading } = useRecentActivity(5);

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
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2"
          >
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              isPro 
                ? 'bg-gradient-pro text-primary-foreground shadow-lg' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {isPro ? (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  PRO
                </>
              ) : 'FREE'}
            </span>
          </motion.div>
        </motion.div>

        {/* Pro Banner */}
        {!isPro && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
          >
            <Link to="/subscription">
              <div className="premium-card rounded-2xl p-5 relative overflow-hidden group">
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-transparent to-secondary/25" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/20 rounded-full blur-2xl" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="pro-badge flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      PRO
                    </span>
                    <span className="text-sm text-foreground font-semibold">أطلق العنان</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    للإبداع الكامل
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    وصول غير محدود لجميع نماذج التوليد الاحترافية
                  </p>
                  <div className="flex items-center gap-2 text-primary text-sm font-bold group-hover:gap-3 transition-all">
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
            <h2 className="text-lg font-bold text-foreground">الأدوات</h2>
            <Link to="/explore" className="text-sm text-primary font-medium hover:underline">عرض الكل</Link>
          </div>
          
          {/* Filter tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === null
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              الكل
            </button>
            {categories.map((category: any) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>

          {/* AI Assistant - Featured Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-4"
          >
            <Link to="/tools/assistant">
              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }}
                className="premium-card rounded-2xl p-5 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-secondary/30" />
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl icon-gradient flex items-center justify-center text-3xl float">
                    🤖
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-foreground">الذكاء المساعد</h3>
                      <span className="ai-badge text-xs">AI</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      تحدث مع الذكاء الاصطناعي واحصل على إجابات فورية
                    </p>
                  </div>
                  <div className="flex items-center text-primary">
                    <MessageCircle className="w-5 h-5" />
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          {/* Tools grid - 3 columns with mini cards */}
          {toolsLoading ? (
            <div className="grid grid-cols-3 gap-3">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="glass-card rounded-2xl p-3 h-24 shimmer" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {filteredTools.slice(0, 9).map((tool: any, index: number) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <ToolCard 
                    variant="mini"
                    tool={{
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
                    }} 
                  />
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

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">النشاط الأخير</h2>
            <Link to="/saved" className="text-sm text-primary font-medium hover:underline">عرض الكل</Link>
          </div>

          <div className="space-y-3">
            {activitiesLoading ? (
              <div className="glass-card rounded-2xl p-4 shimmer h-20" />
            ) : activities.length === 0 ? (
              <div className="glass-card rounded-2xl p-5 neon-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl icon-gradient flex items-center justify-center text-2xl">
                    💬
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">ابدأ محادثة جديدة</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>لا توجد نشاطات سابقة</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              activities.map((activity, index) => (
                <Link key={activity.id} to={activity.tool_url}>
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, x: -4 }}
                    className="glass-card rounded-2xl p-4 neon-border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl icon-gradient flex items-center justify-center text-xl">
                        {activity.tool_icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(activity.created_at).toLocaleDateString('ar-SA')}</span>
                          <span className="mx-1">•</span>
                          <span className="font-medium">{activity.tool_name}</span>
                        </div>
                      </div>
                      <ChevronLeft className="w-5 h-5 text-primary" />
                    </div>
                  </motion.div>
                </Link>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </MobileLayout>
  );
}
