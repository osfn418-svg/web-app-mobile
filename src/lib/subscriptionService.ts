import { supabase } from "@/integrations/supabase/client";

// Plan IDs from database
const PLAN_IDS: Record<string, string> = {
  free: "e1f37ff9-24e8-47f6-b31b-092c9795c41a",
  pro: "88d2e0be-a617-4b86-85a6-d98308c3b5a3",
  enterprise: "57521c64-4b15-496f-8aba-c9ba3f35e7cd",
};

export interface SubscriptionResult {
  success: boolean;
  error?: string;
}

/**
 * Creates or updates user subscription after successful payment
 */
export async function createSubscription(
  userId: string,
  planId: string,
  durationDays: number = 30
): Promise<SubscriptionResult> {
  try {
    const planDbId = PLAN_IDS[planId] || PLAN_IDS.pro;
    
    // Calculate end date
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    // Check if user already has an active subscription
    const { data: existingSub } = await supabase
      .from("user_subscriptions")
      .select("id, end_date")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (existingSub) {
      // Extend existing subscription
      const currentEndDate = new Date(existingSub.end_date);
      const newEndDate = currentEndDate > new Date() 
        ? new Date(currentEndDate.getTime() + durationDays * 24 * 60 * 60 * 1000)
        : endDate;

      const { error } = await supabase
        .from("user_subscriptions")
        .update({
          plan_id: planDbId,
          end_date: newEndDate.toISOString(),
        })
        .eq("id", existingSub.id);

      if (error) throw error;
    } else {
      // Create new subscription
      const { error } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: userId,
          plan_id: planDbId,
          end_date: endDate.toISOString(),
          status: "active",
        });

      if (error) throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Subscription creation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "حدث خطأ أثناء تفعيل الاشتراك",
    };
  }
}

/**
 * Get user's active subscription
 */
export async function getUserSubscription(userId: string) {
  const { data, error } = await supabase
    .from("user_subscriptions")
    .select(`
      *,
      subscription_plans (*)
    `)
    .eq("user_id", userId)
    .eq("status", "active")
    .gte("end_date", new Date().toISOString())
    .single();

  if (error) {
    console.error("Error fetching subscription:", error);
    return null;
  }

  return data;
}
