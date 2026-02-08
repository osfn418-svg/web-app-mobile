import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Lock, 
  Bell, 
  Globe, 
  Moon, 
  Sun,
  HelpCircle, 
  Shield, 
  LogOut,
  Edit2,
  Crown,
  Settings2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/layout/MobileLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { profile, isPro, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('تم تسجيل الخروج');
    navigate('/login');
  };

  const menuItems = [
    { 
      title: 'إدارة', 
      items: isAdmin ? [
        { icon: Settings2, label: 'لوحة التحكم', href: '/admin' },
      ] : []
    },
    { 
      title: 'الأمان', 
      items: [
        { icon: Lock, label: 'تغيير كلمة المرور', href: '#' },
        { icon: Shield, label: 'المصادقة الثنائية', href: '#' },
      ]
    },
    { 
      title: 'التفضيلات', 
      items: [
        { icon: Bell, label: 'الإشعارات', href: '#' },
        { icon: Globe, label: 'اللغة', value: 'العربية', href: '#' },
        { icon: theme === 'dark' ? Moon : Sun, label: theme === 'dark' ? 'الوضع الليلي' : 'الوضع النهاري', toggle: true, isThemeToggle: true, href: '#' },
      ]
    },
    { 
      title: 'الدعم', 
      items: [
        { icon: HelpCircle, label: 'مركز المساعدة', href: '#' },
        { icon: Shield, label: 'سياسة الخصوصية', href: '#' },
      ]
    },
  ].filter(section => section.items.length > 0);

  return (
    <MobileLayout>
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <h1 className="text-2xl font-bold text-foreground">الإعدادات</h1>
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Edit2 className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-primary-foreground">
              {profile?.full_name?.charAt(0) || 'م'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">
                  {profile?.full_name || 'مستخدم'}
                </h2>
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-destructive text-destructive-foreground">
                    أدمن
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  isPro 
                    ? 'bg-gradient-pro text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {isPro ? 'PRO' : 'FREE'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">@{profile?.username}</p>
            </div>
          </div>
        </motion.div>

        {/* Upgrade Banner */}
        {!isPro && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/subscription">
              <div className="glass-card rounded-2xl p-5 neon-border relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10" />
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-pro flex items-center justify-center">
                    <Crown className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">رقّ حسابك إلى Nexus Pro</h3>
                    <p className="text-sm text-muted-foreground">
                      وصول غير محدود لجميع أدوات الذكاء والميزات الحصرية
                    </p>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Menu Sections */}
        {menuItems.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (sectionIndex + 2) }}
          >
            <h3 className="text-sm font-medium text-muted-foreground mb-3">{section.title}</h3>
            <div className="glass-card rounded-2xl overflow-hidden">
              {section.items.map((item, itemIndex) => (
                item.isThemeToggle ? (
                  <button
                    key={item.label}
                    onClick={toggleTheme}
                    className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors w-full ${
                      itemIndex !== section.items.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    <item.icon className="w-5 h-5 text-muted-foreground" />
                    <span className="flex-1 text-foreground text-right">{item.label}</span>
                    <div className={`w-12 h-7 rounded-full relative transition-colors ${
                      theme === 'dark' ? 'bg-primary' : 'bg-muted'
                    }`}>
                      <motion.div 
                        className="absolute top-1 w-5 h-5 bg-foreground rounded-full"
                        animate={{ 
                          right: theme === 'dark' ? 4 : 'auto',
                          left: theme === 'dark' ? 'auto' : 4
                        }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </div>
                  </button>
                ) : (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors ${
                      itemIndex !== section.items.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    <item.icon className="w-5 h-5 text-muted-foreground" />
                    <span className="flex-1 text-foreground">{item.label}</span>
                    {item.value && (
                      <span className="text-sm text-muted-foreground">{item.value}</span>
                    )}
                    <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                  </Link>
                )
              ))}
            </div>
          </motion.div>
        ))}

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={handleLogout}
            className="w-full glass-card rounded-2xl p-4 flex items-center gap-4 hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5 text-destructive" />
            <span className="text-destructive font-medium">تسجيل الخروج</span>
          </button>
        </motion.div>
      </div>
    </MobileLayout>
  );
}
