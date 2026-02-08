import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Search,
  Crown,
  Settings,
  FileText,
  Home,
  ArrowRight,
  X,
  Check,
  Star
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { db, User, AITool, SubscriptionPlan, UserSubscription } from '@/lib/database';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [tools, setTools] = useState<AITool[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'tools' | 'subscriptions'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [allUsers, allTools, allPlans, allSubs] = await Promise.all([
      db.users.toArray(),
      db.ai_tools.toArray(),
      db.subscription_plans.toArray(),
      db.user_subscriptions.toArray(),
    ]);
    setUsers(allUsers);
    setTools(allTools);
    setPlans(allPlans);
    setSubscriptions(allSubs);
  };

  const getUserPlan = (userId: number) => {
    const sub = subscriptions.find(s => s.user_id === userId && s.payment_status === 'active');
    if (!sub) return null;
    return plans.find(p => p.plan_id === sub.plan_id);
  };

  const handleGrantSubscription = async (planId: number) => {
    if (!selectedUser) return;
    
    try {
      // Remove existing active subscriptions
      const existingSubs = await db.user_subscriptions
        .where('user_id')
        .equals(selectedUser.user_id!)
        .toArray();
      
      for (const sub of existingSubs) {
        await db.user_subscriptions.update(sub.subscription_id!, { payment_status: 'expired' });
      }

      // Add new subscription
      const plan = plans.find(p => p.plan_id === planId);
      if (plan && plan.plan_duration > 0) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.plan_duration);

        await db.user_subscriptions.add({
          user_id: selectedUser.user_id!,
          plan_id: planId,
          start_date: startDate,
          end_date: endDate,
          payment_status: 'active',
        });
      }

      await loadData();
      setShowPlanModal(false);
      setSelectedUser(null);
      toast.success(`تم منح اشتراك ${plan?.plan_name} بنجاح`);
    } catch (error) {
      toast.error('حدث خطأ أثناء منح الاشتراك');
    }
  };

  const handleToggleToolStatus = async (toolId: number, currentStatus: boolean) => {
    await db.ai_tools.update(toolId, { approved: !currentStatus });
    await loadData();
    toast.success(currentStatus ? 'تم إيقاف الأداة' : 'تم تفعيل الأداة');
  };

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTools = tools.filter(tool =>
    tool.tool_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { 
      label: 'إجمالي المستخدمين', 
      value: users.length.toString(), 
      change: '+5 هذا الأسبوع', 
      icon: Users,
      color: 'text-primary'
    },
    { 
      label: 'المشتركين Pro', 
      value: subscriptions.filter(s => s.payment_status === 'active').length.toString(), 
      change: 'مشتركين نشطين', 
      icon: Crown,
      color: 'text-warning'
    },
  ];

  const navItems = [
    { icon: ArrowRight, label: 'رجوع', path: '/home' },
    { icon: Home, label: 'الرئيسية', path: '/admin' },
    { icon: Users, label: 'المستخدمين', path: '/admin/users' },
    { icon: Settings, label: 'الإعدادات', path: '/admin/settings' },
  ];

  return (
    <div className="app-container bg-background min-h-screen" dir="rtl">
      <div className="px-4 py-6 pb-24 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
            <p className="text-muted-foreground">مرحباً، المسؤول 👋</p>
          </div>
          <Link to="/home" className="p-2 hover:bg-muted rounded-xl transition-colors">
            <ArrowRight className="w-5 h-5 text-foreground" />
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="glass-card rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-xs text-success mt-1">{stat.change}</p>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2"
        >
          <button
            onClick={() => { setActiveTab('users'); setSearchQuery(''); }}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            المستخدمين
          </button>
          <button
            onClick={() => { setActiveTab('tools'); setSearchQuery(''); }}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'tools'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            الأدوات
          </button>
          <button
            onClick={() => { setActiveTab('subscriptions'); setSearchQuery(''); }}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'subscriptions'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            الاشتراكات
          </button>
        </motion.div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={activeTab === 'users' ? 'ابحث عن مستخدم...' : activeTab === 'tools' ? 'ابحث عن أداة...' : 'ابحث...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {filteredUsers.map((user, index) => {
              const userPlan = getUserPlan(user.user_id!);
              return (
                <motion.div
                  key={user.user_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="glass-card rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-lg font-bold text-primary-foreground">
                      {user.full_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-foreground">{user.full_name}</p>
                        {user.role === 'admin' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-pro text-primary-foreground">
                            Admin
                          </span>
                        )}
                        {userPlan && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-warning/20 text-warning">
                            {userPlan.plan_name}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <button 
                      onClick={() => { setSelectedUser(user); setShowPlanModal(true); }}
                      className="px-3 py-2 bg-primary/20 text-primary rounded-lg text-xs font-medium hover:bg-primary/30 transition-colors"
                    >
                      منح اشتراك
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Tools Tab */}
        {activeTab === 'tools' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">إجمالي الأدوات: <span className="text-foreground font-bold">{tools.length}</span></p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-success">نشطة: {tools.filter(t => t.approved).length}</span>
                  <span className="text-destructive">معطلة: {tools.filter(t => !t.approved).length}</span>
                </div>
              </div>
            </div>

            {filteredTools.map((tool, index) => (
              <motion.div
                key={tool.tool_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
                className="glass-card rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
                    {tool.logo_url}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{tool.tool_name}</p>
                      {tool.requires_subscription && (
                        <span className="pro-badge">PRO</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="w-3 h-3 text-warning fill-warning" />
                      <span className="text-xs text-muted-foreground">{tool.rating}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleToolStatus(tool.tool_id!, tool.approved)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      tool.approved 
                        ? 'bg-destructive/20 text-destructive hover:bg-destructive/30' 
                        : 'bg-success/20 text-success hover:bg-success/30'
                    }`}
                  >
                    {tool.approved ? 'إيقاف' : 'تفعيل'}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-foreground">خطط الاشتراك</h3>
            {plans.map((plan, index) => {
              const activeCount = subscriptions.filter(s => s.plan_id === plan.plan_id && s.payment_status === 'active').length;
              return (
                <motion.div
                  key={plan.plan_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="glass-card rounded-xl p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        plan.plan_name === 'مجاني' ? 'bg-muted' : 'bg-gradient-pro'
                      }`}>
                        <Crown className={`w-5 h-5 ${plan.plan_name === 'مجاني' ? 'text-muted-foreground' : 'text-primary-foreground'}`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{plan.plan_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {plan.price === 0 ? 'مجاني' : `$${plan.price}/${plan.plan_duration} يوم`}
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-bold text-foreground">{activeCount}</p>
                      <p className="text-xs text-muted-foreground">مشترك</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-success" />
                    <span>{plan.max_tools_access === -1 ? 'وصول غير محدود' : `${plan.max_tools_access} أدوات`}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Plan Selection Modal */}
      <AnimatePresence>
        {showPlanModal && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowPlanModal(false); setSelectedUser(null); }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto"
            >
              <div className="bg-card border-t border-border rounded-t-3xl p-6 pb-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">منح اشتراك</h3>
                    <p className="text-sm text-muted-foreground">{selectedUser.full_name}</p>
                  </div>
                  <button
                    onClick={() => { setShowPlanModal(false); setSelectedUser(null); }}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                <div className="space-y-3">
                  {plans.filter(p => p.price > 0).map((plan) => (
                    <button
                      key={plan.plan_id}
                      onClick={() => handleGrantSubscription(plan.plan_id!)}
                      className="w-full glass-card rounded-xl p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors text-right"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-pro flex items-center justify-center">
                        <Crown className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{plan.plan_name}</h4>
                        <p className="text-sm text-muted-foreground">${plan.price} / {plan.plan_duration} يوم</p>
                      </div>
                      <Check className="w-5 h-5 text-success" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Admin Bottom Nav */}
      <nav className="bottom-nav safe-bottom">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center gap-1 py-2 px-4"
              >
                {isActive && (
                  <motion.div
                    layoutId="adminNavIndicator"
                    className="absolute -top-1 w-8 h-1 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                />
                <span
                  className={`text-xs transition-colors ${
                    isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
