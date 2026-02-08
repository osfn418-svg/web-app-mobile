import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Search,
  MoreVertical,
  Crown,
  Settings,
  FileText,
  Home
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { db, User, AITool } from '@/lib/database';

export default function AdminDashboard() {
  const location = useLocation();
  const [users, setUsers] = useState<User[]>([]);
  const [tools, setTools] = useState<AITool[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'tools' | 'subscriptions'>('users');

  useEffect(() => {
    const loadData = async () => {
      const allUsers = await db.users.toArray();
      const allTools = await db.ai_tools.toArray();
      setUsers(allUsers);
      setTools(allTools);
    };
    loadData();
  }, []);

  const stats = [
    { 
      label: 'إجمالي الإيرادات', 
      value: '$42,593', 
      change: '+12.5%', 
      icon: DollarSign,
      color: 'text-success'
    },
    { 
      label: 'مستخدم نشط', 
      value: '2.4k', 
      change: 'مقارنة بالشهر الماضي', 
      icon: Users,
      color: 'text-primary'
    },
  ];

  const navItems = [
    { icon: Home, label: 'الرئيسية', path: '/admin' },
    { icon: Users, label: 'استكشاف', path: '/admin/users' },
    { icon: FileText, label: 'التقارير', path: '/admin/reports' },
    { icon: Settings, label: 'الإعدادات', path: '/admin/settings' },
  ];

  return (
    <div className="app-container bg-background min-h-screen" dir="rtl">
      <div className="px-4 py-6 pb-24 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
          <p className="text-muted-foreground">مرحباً، المسؤول 👋</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4"
        >
          {stats.map((stat, index) => (
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
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            إدارة المستخدمين
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'tools'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            أدوات الذكاء
          </button>
        </motion.div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="ابحث عن مستخدم..."
                className="w-full pr-10 pl-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* User List */}
            <div className="space-y-3">
              {users.map((user, index) => (
                <motion.div
                  key={user.user_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="glass-card rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-primary-foreground">
                      {user.full_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground truncate">{user.full_name}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-gradient-pro text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {user.role === 'admin' ? 'Admin' : 'Free'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tools Tab */}
        {activeTab === 'tools' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="ابحث عن أداة..."
                className="w-full pr-10 pl-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Stats */}
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">إجمالي الأدوات: <span className="text-foreground font-bold">{tools.length}</span></p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-success">نشطة: {tools.filter(t => t.approved).length}</span>
                  <span className="text-destructive">معطلة: {tools.filter(t => !t.approved).length}</span>
                </div>
              </div>
            </div>

            {/* Tools List */}
            <div className="space-y-3">
              {tools.map((tool, index) => (
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
                      <p className="text-sm text-muted-foreground truncate">{tool.tool_description}</p>
                    </div>
                    <div className="text-left">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        tool.approved 
                          ? 'bg-success/20 text-success' 
                          : 'bg-destructive/20 text-destructive'
                      }`}>
                        {tool.approved ? 'نشط' : 'موقوف'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

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
