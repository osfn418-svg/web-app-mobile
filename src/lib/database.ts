import Dexie, { type EntityTable } from 'dexie';

// Database Types
export interface User {
  user_id?: number;
  username: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: 'user' | 'admin';
  created_at: Date;
  is_active: boolean;
}

export interface Admin {
  admin_id?: number;
  user_id: number;
  admin_level: string;
}

export interface Category {
  category_id?: number;
  category_name: string;
  parent_category_id?: number;
  requires_subscription: boolean;
}

export interface AITool {
  tool_id?: number;
  tool_name: string;
  tool_description: string;
  tool_url: string;
  category_id: number;
  requires_subscription: boolean;
  logo_url: string;
  added_by_admin: number;
  approved: boolean;
  rating: number;
}

export interface Feature {
  feature_id?: number;
  feature_name: string;
  feature_description: string;
}

export interface ToolFeature {
  id?: number;
  feature_id: number;
  tool_id: number;
}

export interface Review {
  review_id?: number;
  user_id: number;
  tool_id: number;
  rating: number;
  review_text: string;
}

export interface SubscriptionPlan {
  plan_id?: number;
  plan_name: string;
  plan_duration: number;
  price: number;
  currency: string;
  max_tools_access: number;
}

export interface UserSubscription {
  subscription_id?: number;
  user_id: number;
  plan_id: number;
  start_date: Date;
  end_date: Date;
  payment_status: 'active' | 'pending' | 'cancelled' | 'expired';
}

export interface SubscriptionTool {
  id?: number;
  subscription_id: number;
  tool_id: number;
  is_active: boolean;
}

export interface ChatConversation {
  conversation_id?: number;
  user_id: number;
  tool_id: number;
  user_message: string;
  ai_response: string;
  created_at: Date;
}

export interface AdminActivity {
  activity_id?: number;
  admin_id: number;
  activity_type: string;
  activity_description: string;
  activity_time: Date;
}

// Database class
class NexusDatabase extends Dexie {
  users!: EntityTable<User, 'user_id'>;
  admins!: EntityTable<Admin, 'admin_id'>;
  categories!: EntityTable<Category, 'category_id'>;
  ai_tools!: EntityTable<AITool, 'tool_id'>;
  features!: EntityTable<Feature, 'feature_id'>;
  tool_features!: EntityTable<ToolFeature, 'id'>;
  reviews!: EntityTable<Review, 'review_id'>;
  subscription_plans!: EntityTable<SubscriptionPlan, 'plan_id'>;
  user_subscriptions!: EntityTable<UserSubscription, 'subscription_id'>;
  subscription_tools!: EntityTable<SubscriptionTool, 'id'>;
  chat_conversations!: EntityTable<ChatConversation, 'conversation_id'>;
  admin_activities!: EntityTable<AdminActivity, 'activity_id'>;

  constructor() {
    super('NexusAIHub');
    
    this.version(1).stores({
      users: '++user_id, username, email, role, is_active',
      admins: '++admin_id, user_id',
      categories: '++category_id, category_name, parent_category_id',
      ai_tools: '++tool_id, tool_name, category_id, requires_subscription, approved, rating',
      features: '++feature_id, feature_name',
      tool_features: '++id, feature_id, tool_id',
      reviews: '++review_id, user_id, tool_id',
      subscription_plans: '++plan_id, plan_name',
      user_subscriptions: '++subscription_id, user_id, plan_id, payment_status',
      subscription_tools: '++id, subscription_id, tool_id',
      chat_conversations: '++conversation_id, user_id, tool_id, created_at',
      admin_activities: '++activity_id, admin_id, activity_type, activity_time',
    });
  }
}

export const db = new NexusDatabase();

// Initialize with seed data
export async function initializeDatabase(forceReset = false) {
  if (forceReset) {
    await db.delete();
    await db.open();
  }
  
  const usersCount = await db.users.count();
  
  if (usersCount === 0) {
    // Seed categories
    await db.categories.bulkAdd([
      { category_name: 'توليد الصور', requires_subscription: false },
      { category_name: 'توليد النصوص', requires_subscription: false },
      { category_name: 'توليد الفيديو', requires_subscription: true },
      { category_name: 'توليد الصوت', requires_subscription: true },
      { category_name: 'البرمجة', requires_subscription: false },
      { category_name: 'تحليل المستندات', requires_subscription: true },
    ]);

    // Seed subscription plans
    await db.subscription_plans.bulkAdd([
      { 
        plan_name: 'مجاني', 
        plan_duration: 0, 
        price: 0, 
        currency: 'USD', 
        max_tools_access: 5 
      },
      { 
        plan_name: 'Nexus Pro', 
        plan_duration: 30, 
        price: 19.99, 
        currency: 'USD', 
        max_tools_access: -1 // unlimited
      },
      { 
        plan_name: 'للشركات', 
        plan_duration: 30, 
        price: 99.00, 
        currency: 'USD', 
        max_tools_access: -1 
      },
    ]);

    // Seed AI tools
    await db.ai_tools.bulkAdd([
      {
        tool_name: 'الذكاء المساعد',
        tool_description: 'محادثة وتلخيص مع ذكاء اصطناعي متقدم',
        tool_url: '/tools/assistant',
        category_id: 2,
        requires_subscription: false,
        logo_url: '🤖',
        added_by_admin: 1,
        approved: true,
        rating: 4.8,
      },
      {
        tool_name: 'توليد الفيديو',
        tool_description: 'نص إلى فيديو سينمائي بجودة عالية',
        tool_url: '/tools/video',
        category_id: 3,
        requires_subscription: true,
        logo_url: '🎬',
        added_by_admin: 1,
        approved: true,
        rating: 4.9,
      },
      {
        tool_name: 'توليد الصور',
        tool_description: 'حول خيالك لواقع بصور مذهلة',
        tool_url: '/tools/images',
        category_id: 1,
        requires_subscription: true,
        logo_url: '🖼️',
        added_by_admin: 1,
        approved: true,
        rating: 4.7,
      },
      {
        tool_name: 'المحادثة الصوتية',
        tool_description: 'تفاعل صوتي طبيعي وسلس',
        tool_url: '/tools/voice-chat',
        category_id: 4,
        requires_subscription: true,
        logo_url: '🎙️',
        added_by_admin: 1,
        approved: true,
        rating: 4.6,
      },
      {
        tool_name: 'محرر الأكواد',
        tool_description: 'بناء وتصحيح البرمجيات بذكاء',
        tool_url: '/tools/code',
        category_id: 5,
        requires_subscription: true,
        logo_url: '💻',
        added_by_admin: 1,
        approved: true,
        rating: 4.8,
      },
      {
        tool_name: 'توليد الصوت',
        tool_description: 'موسيقى ومؤثرات صوتية احترافية',
        tool_url: '/tools/audio',
        category_id: 4,
        requires_subscription: true,
        logo_url: '🎵',
        added_by_admin: 1,
        approved: true,
        rating: 4.5,
      },
      {
        tool_name: 'صانع الأوامر',
        tool_description: 'إنشاء prompts احترافية للنماذج',
        tool_url: '/tools/prompt-maker',
        category_id: 2,
        requires_subscription: false,
        logo_url: '✨',
        added_by_admin: 1,
        approved: true,
        rating: 4.4,
      },
      {
        tool_name: 'محلل المستندات',
        tool_description: 'استخراج وتحليل البيانات من الملفات',
        tool_url: '/tools/document',
        category_id: 6,
        requires_subscription: true,
        logo_url: '📄',
        added_by_admin: 1,
        approved: true,
        rating: 4.7,
      },
    ]);

    // Seed demo user
    await db.users.add({
      username: 'demo_user',
      email: 'demo@example.com',
      password_hash: 'demo123',
      full_name: 'أحمد محمد',
      role: 'user',
      created_at: new Date(),
      is_active: true,
    });

    // Seed main admin user (osamasufyanos)
    const mainAdminId = await db.users.add({
      username: 'osamasufyanos',
      email: 'osamasufyanos@gmail.com',
      password_hash: 'os00',
      full_name: 'أسامة سفيان',
      role: 'admin',
      created_at: new Date(),
      is_active: true,
    });

    await db.admins.add({
      user_id: mainAdminId,
      admin_level: 'super',
    });

    // Seed secondary admin user
    const adminUserId = await db.users.add({
      username: 'admin',
      email: 'admin@nexus.ai',
      password_hash: 'admin123',
      full_name: 'مدير النظام',
      role: 'admin',
      created_at: new Date(),
      is_active: true,
    });

    await db.admins.add({
      user_id: adminUserId,
      admin_level: 'admin',
    });

    console.log('Database initialized with seed data');
  }
}

// Auth helpers
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await db.users.where('email').equals(email).first();
  if (user && user.password_hash === password && user.is_active) {
    return user;
  }
  return null;
}

export async function registerUser(userData: Omit<User, 'user_id' | 'created_at' | 'is_active' | 'role'>): Promise<number> {
  return await db.users.add({
    ...userData,
    role: 'user',
    created_at: new Date(),
    is_active: true,
  });
}

export async function getUserSubscription(userId: number): Promise<UserSubscription | null> {
  const subscription = await db.user_subscriptions
    .where('user_id')
    .equals(userId)
    .and(sub => sub.payment_status === 'active')
    .first();
  return subscription || null;
}

export async function getSubscriptionPlan(planId: number): Promise<SubscriptionPlan | undefined> {
  return await db.subscription_plans.get(planId);
}

export async function getAllTools(): Promise<AITool[]> {
  // Get all approved tools - Dexie stores booleans as 0/1
  const tools = await db.ai_tools.toArray();
  return tools.filter(t => t.approved === true);
}

export async function getToolsByCategory(categoryId: number): Promise<AITool[]> {
  return await db.ai_tools.where('category_id').equals(categoryId).toArray();
}

export async function getChatHistory(userId: number, toolId?: number): Promise<ChatConversation[]> {
  let query = db.chat_conversations.where('user_id').equals(userId);
  if (toolId) {
    query = query.and(chat => chat.tool_id === toolId);
  }
  return await query.sortBy('created_at');
}

export async function saveChat(chat: Omit<ChatConversation, 'conversation_id'>): Promise<number> {
  return await db.chat_conversations.add(chat);
}

// Reset database to apply new seed data
export async function resetDatabase(): Promise<void> {
  await db.delete();
  await db.open();
  await initializeDatabase();
}
