import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Users, 
  Settings, 
  Plus,
  Edit2,
  Trash2,
  Ban,
  CheckCircle,
  Crown,
  X,
  Package,
  CreditCard,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminTools, useAdminPlans, useAdminCategories, useAllProfiles } from '@/hooks/useRealtimeData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Tab = 'users' | 'tools' | 'plans' | 'categories';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('users');
  
  const tabs = [
    { id: 'users' as Tab, label: 'المستخدمين', icon: Users },
    { id: 'tools' as Tab, label: 'الأدوات', icon: Package },
    { id: 'plans' as Tab, label: 'الخطط', icon: CreditCard },
    { id: 'categories' as Tab, label: 'الفئات', icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="glass sticky top-0 z-40 px-4 py-4 safe-top">
        <div className="flex items-center gap-3">
          <Link to="/profile" className="p-2 hover:bg-muted rounded-xl transition-colors">
            <ArrowRight className="w-5 h-5 text-foreground" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">لوحة التحكم</h1>
            <p className="text-xs text-muted-foreground">مرحباً {profile?.full_name}</p>
          </div>
          <Settings className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'users' && <UsersTab key="users" />}
          {activeTab === 'tools' && <ToolsTab key="tools" />}
          {activeTab === 'plans' && <PlansTab key="plans" />}
          {activeTab === 'categories' && <CategoriesTab key="categories" />}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Users Tab
function UsersTab() {
  const { data: users, loading, error, refetch } = useAllProfiles();
  const { data: plans } = useAdminPlans();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [duration, setDuration] = useState(30);

  const handleBan = async () => {
    if (!selectedUser) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: true, ban_reason: banReason })
      .eq('id', selectedUser.id);

    if (error) {
      toast.error('فشل في حظر المستخدم');
    } else {
      toast.success('تم حظر المستخدم');
      setShowBanModal(false);
      setBanReason('');
      refetch();
    }
  };

  const handleUnban = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: false, ban_reason: null })
      .eq('id', userId);

    if (error) {
      toast.error('فشل في رفع الحظر');
    } else {
      toast.success('تم رفع الحظر');
      refetch();
    }
  };

  const handleGrantSubscription = async () => {
    if (!selectedUser || !selectedPlan) return;

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);

    const { error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: selectedUser.user_id,
        plan_id: selectedPlan,
        end_date: endDate.toISOString(),
        status: 'active'
      });

    if (error) {
      toast.error('فشل في منح الاشتراك');
    } else {
      toast.success('تم منح الاشتراك بنجاح');
      setShowSubscriptionModal(false);
      setSelectedPlan('');
      refetch();
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        فشل تحميل المستخدمين: {error}
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          المستخدمين ({users.length})
        </h2>
      </div>

      <div className="space-y-3">
        {users.map((user: any) => (
          <div key={user.id} className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                user.is_banned ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'
              }`}>
                {user.full_name?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground truncate">{user.full_name}</p>
                  {user.user_roles?.some((r: any) => r.role === 'admin') && (
                    <span className="px-2 py-0.5 bg-destructive text-destructive-foreground text-xs rounded-full">أدمن</span>
                  )}
                  {user.is_banned && (
                    <span className="px-2 py-0.5 bg-destructive/20 text-destructive text-xs rounded-full">محظور</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">@{user.username}</p>
                {user.user_subscriptions?.[0] && (
                  <p className="text-xs text-success mt-1">
                    {user.user_subscriptions[0].subscription_plans?.name} - نشط
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setSelectedUser(user); setShowSubscriptionModal(true); }}
                  className="p-2 hover:bg-primary/20 rounded-lg transition-colors"
                  title="منح اشتراك"
                >
                  <Crown className="w-4 h-4 text-primary" />
                </button>
                {user.is_banned ? (
                  <button
                    onClick={() => handleUnban(user.id)}
                    className="p-2 hover:bg-success/20 rounded-lg transition-colors"
                    title="رفع الحظر"
                  >
                    <CheckCircle className="w-4 h-4 text-success" />
                  </button>
                ) : (
                  <button
                    onClick={() => { setSelectedUser(user); setShowBanModal(true); }}
                    className="p-2 hover:bg-destructive/20 rounded-lg transition-colors"
                    title="حظر"
                  >
                    <Ban className="w-4 h-4 text-destructive" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Subscription Modal */}
      <AnimatePresence>
        {showSubscriptionModal && (
          <Modal onClose={() => setShowSubscriptionModal(false)} title="منح اشتراك">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                منح اشتراك لـ: <strong>{selectedUser?.full_name}</strong>
              </p>
              <div>
                <label className="text-sm text-muted-foreground">الخطة</label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="w-full mt-1 p-3 bg-muted border border-border rounded-xl text-foreground"
                >
                  <option value="">اختر خطة</option>
                  {plans.filter((p: any) => p.price > 0).map((plan: any) => (
                    <option key={plan.id} value={plan.id}>{plan.name} - ${plan.price}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">المدة (أيام)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full mt-1 p-3 bg-muted border border-border rounded-xl text-foreground"
                />
              </div>
              <button
                onClick={handleGrantSubscription}
                disabled={!selectedPlan}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-50"
              >
                منح الاشتراك
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Ban Modal */}
      <AnimatePresence>
        {showBanModal && (
          <Modal onClose={() => setShowBanModal(false)} title="حظر مستخدم">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                حظر المستخدم: <strong>{selectedUser?.full_name}</strong>
              </p>
              <div>
                <label className="text-sm text-muted-foreground">سبب الحظر</label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="أدخل سبب الحظر..."
                  className="w-full mt-1 p-3 bg-muted border border-border rounded-xl text-foreground min-h-[100px]"
                />
              </div>
              <button
                onClick={handleBan}
                className="w-full py-3 bg-destructive text-destructive-foreground rounded-xl font-medium"
              >
                تأكيد الحظر
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Tools Tab
function ToolsTab() {
  const { data: tools, loading, refetch } = useAdminTools();
  const { data: categories } = useAdminCategories();
  const [showModal, setShowModal] = useState(false);
  const [editingTool, setEditingTool] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    url: '',
    category_id: '',
    logo_url: '',
    requires_subscription: false
  });

  const resetForm = () => {
    setForm({ name: '', description: '', url: '', category_id: '', logo_url: '', requires_subscription: false });
    setEditingTool(null);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.url) {
      toast.error('يرجى ملء الحقول المطلوبة');
      return;
    }

    if (editingTool) {
      const { error } = await supabase
        .from('ai_tools')
        .update(form)
        .eq('id', editingTool.id);

      if (error) toast.error('فشل في التحديث');
      else { toast.success('تم التحديث'); setShowModal(false); resetForm(); refetch(); }
    } else {
      const { error } = await supabase
        .from('ai_tools')
        .insert({ ...form, is_approved: true, is_active: true });

      if (error) toast.error('فشل في الإضافة');
      else { toast.success('تمت الإضافة'); setShowModal(false); resetForm(); refetch(); }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    const { error } = await supabase.from('ai_tools').delete().eq('id', id);
    if (error) toast.error('فشل في الحذف');
    else { toast.success('تم الحذف'); refetch(); }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('ai_tools').update({ is_active: !current }).eq('id', id);
    if (error) toast.error('فشل في التحديث');
    else refetch();
  };

  const openEdit = (tool: any) => {
    setEditingTool(tool);
    setForm({
      name: tool.name,
      description: tool.description,
      url: tool.url,
      category_id: tool.category_id || '',
      logo_url: tool.logo_url || '',
      requires_subscription: tool.requires_subscription
    });
    setShowModal(true);
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">الأدوات ({tools.length})</h2>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm">
          <Plus className="w-4 h-4" /> إضافة
        </button>
      </div>

      <div className="space-y-3">
        {tools.map((tool: any) => (
          <div key={tool.id} className={`glass-card rounded-xl p-4 ${!tool.is_active ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">{tool.logo_url || '🔧'}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{tool.name}</p>
                  {tool.requires_subscription && <span className="pro-badge text-xs">PRO</span>}
                  {!tool.is_active && <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">معطل</span>}
                </div>
                <p className="text-xs text-muted-foreground truncate">{tool.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(tool)} className="p-2 hover:bg-muted rounded-lg"><Edit2 className="w-4 h-4 text-muted-foreground" /></button>
                <button onClick={() => handleToggleActive(tool.id, tool.is_active)} className="p-2 hover:bg-muted rounded-lg">
                  {tool.is_active ? <Ban className="w-4 h-4 text-orange-500" /> : <CheckCircle className="w-4 h-4 text-success" />}
                </button>
                <button onClick={() => handleDelete(tool.id)} className="p-2 hover:bg-destructive/20 rounded-lg"><Trash2 className="w-4 h-4 text-destructive" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <Modal onClose={() => { setShowModal(false); resetForm(); }} title={editingTool ? 'تعديل أداة' : 'إضافة أداة'}>
            <div className="space-y-4">
              <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="اسم الأداة *" className="w-full p-3 bg-muted border border-border rounded-xl text-foreground" />
              <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="الوصف" className="w-full p-3 bg-muted border border-border rounded-xl text-foreground min-h-[80px]" />
              <input value={form.url} onChange={(e) => setForm(f => ({ ...f, url: e.target.value }))} placeholder="الرابط (مثل /tools/my-tool) *" className="w-full p-3 bg-muted border border-border rounded-xl text-foreground" />
              <input value={form.logo_url} onChange={(e) => setForm(f => ({ ...f, logo_url: e.target.value }))} placeholder="الأيقونة (emoji مثل 🤖)" className="w-full p-3 bg-muted border border-border rounded-xl text-foreground" />
              <select value={form.category_id} onChange={(e) => setForm(f => ({ ...f, category_id: e.target.value }))} className="w-full p-3 bg-muted border border-border rounded-xl text-foreground">
                <option value="">اختر فئة</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.requires_subscription} onChange={(e) => setForm(f => ({ ...f, requires_subscription: e.target.checked }))} className="rounded" />
                <span className="text-sm text-foreground">يتطلب اشتراك Pro</span>
              </label>
              <button onClick={handleSubmit} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium">{editingTool ? 'تحديث' : 'إضافة'}</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Plans Tab
function PlansTab() {
  const { data: plans, loading, refetch } = useAdminPlans();
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    duration_days: 30,
    max_tools_access: -1
  });

  const resetForm = () => {
    setForm({ name: '', description: '', price: 0, duration_days: 30, max_tools_access: -1 });
    setEditingPlan(null);
  };

  const handleSubmit = async () => {
    if (!form.name) { toast.error('يرجى إدخال اسم الخطة'); return; }

    if (editingPlan) {
      const { error } = await supabase.from('subscription_plans').update(form).eq('id', editingPlan.id);
      if (error) {
        console.error('Plan update error:', error);
        toast.error('فشل في التحديث: ' + error.message);
      } else { 
        toast.success('تم التحديث'); 
        setShowModal(false); 
        resetForm(); 
        refetch(); 
      }
    } else {
      const { error } = await supabase.from('subscription_plans').insert({ 
        ...form, 
        is_active: true,
        features: [],
        currency: 'USD'
      });
      if (error) {
        console.error('Plan insert error:', error);
        toast.error('فشل في الإضافة: ' + error.message);
      } else { 
        toast.success('تمت الإضافة'); 
        setShowModal(false); 
        resetForm(); 
        refetch(); 
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    const { error } = await supabase.from('subscription_plans').delete().eq('id', id);
    if (error) toast.error('فشل في الحذف');
    else { toast.success('تم الحذف'); refetch(); }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('subscription_plans').update({ is_active: !current }).eq('id', id);
    if (error) toast.error('فشل في التحديث');
    else refetch();
  };

  const openEdit = (plan: any) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      description: plan.description || '',
      price: plan.price,
      duration_days: plan.duration_days,
      max_tools_access: plan.max_tools_access
    });
    setShowModal(true);
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">خطط الاشتراك ({plans.length})</h2>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm">
          <Plus className="w-4 h-4" /> إضافة
        </button>
      </div>

      <div className="space-y-3">
        {plans.map((plan: any) => (
          <div key={plan.id} className={`glass-card rounded-xl p-4 ${!plan.is_active ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{plan.name}</p>
                  {!plan.is_active && <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">معطل</span>}
                </div>
                <p className="text-lg font-bold text-primary">${plan.price} <span className="text-xs text-muted-foreground font-normal">/ {plan.duration_days} يوم</span></p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(plan)} className="p-2 hover:bg-muted rounded-lg"><Edit2 className="w-4 h-4 text-muted-foreground" /></button>
                <button onClick={() => handleToggleActive(plan.id, plan.is_active)} className="p-2 hover:bg-muted rounded-lg">
                  {plan.is_active ? <Ban className="w-4 h-4 text-orange-500" /> : <CheckCircle className="w-4 h-4 text-success" />}
                </button>
                <button onClick={() => handleDelete(plan.id)} className="p-2 hover:bg-destructive/20 rounded-lg"><Trash2 className="w-4 h-4 text-destructive" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <Modal onClose={() => { setShowModal(false); resetForm(); }} title={editingPlan ? 'تعديل خطة' : 'إضافة خطة'}>
            <div className="space-y-4">
              <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="اسم الخطة *" className="w-full p-3 bg-muted border border-border rounded-xl text-foreground" />
              <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="الوصف" className="w-full p-3 bg-muted border border-border rounded-xl text-foreground min-h-[80px]" />
              <input type="number" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: parseFloat(e.target.value) }))} placeholder="السعر (USD)" className="w-full p-3 bg-muted border border-border rounded-xl text-foreground" />
              <input type="number" value={form.duration_days} onChange={(e) => setForm(f => ({ ...f, duration_days: parseInt(e.target.value) }))} placeholder="المدة (أيام)" className="w-full p-3 bg-muted border border-border rounded-xl text-foreground" />
              <button onClick={handleSubmit} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium">{editingPlan ? 'تحديث' : 'إضافة'}</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Categories Tab
function CategoriesTab() {
  const { data: categories, loading, refetch } = useAdminCategories();
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '', requires_subscription: false });

  const resetForm = () => { setForm({ name: '', description: '', icon: '', requires_subscription: false }); setEditingCat(null); };

  const handleSubmit = async () => {
    if (!form.name) { toast.error('يرجى إدخال اسم الفئة'); return; }

    if (editingCat) {
      const { error } = await supabase.from('categories').update(form).eq('id', editingCat.id);
      if (error) toast.error('فشل في التحديث');
      else { toast.success('تم التحديث'); setShowModal(false); resetForm(); refetch(); }
    } else {
      const { error } = await supabase.from('categories').insert({ ...form, is_active: true });
      if (error) toast.error('فشل في الإضافة');
      else { toast.success('تمت الإضافة'); setShowModal(false); resetForm(); refetch(); }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) toast.error('فشل في الحذف');
    else { toast.success('تم الحذف'); refetch(); }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('categories').update({ is_active: !current }).eq('id', id);
    if (error) toast.error('فشل في التحديث');
    else refetch();
  };

  const openEdit = (cat: any) => {
    setEditingCat(cat);
    setForm({ name: cat.name, description: cat.description || '', icon: cat.icon || '', requires_subscription: cat.requires_subscription });
    setShowModal(true);
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">الفئات ({categories.length})</h2>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm">
          <Plus className="w-4 h-4" /> إضافة
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat: any) => (
          <div key={cat.id} className={`glass-card rounded-xl p-4 ${!cat.is_active ? 'opacity-50' : ''}`}>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-muted flex items-center justify-center text-2xl mb-2">{cat.icon || '📁'}</div>
              <p className="font-medium text-foreground text-sm">{cat.name}</p>
              {cat.requires_subscription && <span className="pro-badge text-xs mt-1">PRO</span>}
              <div className="flex justify-center gap-2 mt-3">
                <button onClick={() => openEdit(cat)} className="p-1.5 hover:bg-muted rounded-lg"><Edit2 className="w-3 h-3 text-muted-foreground" /></button>
                <button onClick={() => handleToggleActive(cat.id, cat.is_active)} className="p-1.5 hover:bg-muted rounded-lg">
                  {cat.is_active ? <Ban className="w-3 h-3 text-orange-500" /> : <CheckCircle className="w-3 h-3 text-success" />}
                </button>
                <button onClick={() => handleDelete(cat.id)} className="p-1.5 hover:bg-destructive/20 rounded-lg"><Trash2 className="w-3 h-3 text-destructive" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <Modal onClose={() => { setShowModal(false); resetForm(); }} title={editingCat ? 'تعديل فئة' : 'إضافة فئة'}>
            <div className="space-y-4">
              <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="اسم الفئة *" className="w-full p-3 bg-muted border border-border rounded-xl text-foreground" />
              <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="الوصف" className="w-full p-3 bg-muted border border-border rounded-xl text-foreground min-h-[80px]" />
              <input value={form.icon} onChange={(e) => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="الأيقونة (emoji مثل 📁)" className="w-full p-3 bg-muted border border-border rounded-xl text-foreground" />
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.requires_subscription} onChange={(e) => setForm(f => ({ ...f, requires_subscription: e.target.checked }))} className="rounded" />
                <span className="text-sm text-foreground">يتطلب اشتراك Pro</span>
              </label>
              <button onClick={handleSubmit} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium">{editingCat ? 'تحديث' : 'إضافة'}</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Modal Component
function Modal({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md glass-card rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}
