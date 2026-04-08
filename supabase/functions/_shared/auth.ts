import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

export interface AuthResult {
  user: { id: string; email?: string } | null;
  error: string | null;
}

/**
 * Validates JWT token from Authorization header using getUser()
 * Returns user info if valid, error message if invalid
 */
export async function validateAuth(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { user: null, error: "يجب تسجيل الدخول للوصول لهذه الخدمة" };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
    return { user: null, error: "خطأ في إعدادات الخادم" };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.error("Auth validation error:", error?.message || "No user");
      return { user: null, error: "جلسة غير صالحة، يرجى تسجيل الدخول مرة أخرى" };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      error: null,
    };
  } catch (e) {
    console.error("Auth exception:", e);
    return { user: null, error: "خطأ في التحقق من الهوية" };
  }
}

/**
 * Helper to create unauthorized response
 */
export function unauthorizedResponse(message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
