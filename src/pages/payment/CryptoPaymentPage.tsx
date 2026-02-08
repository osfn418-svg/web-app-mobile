import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MobileLayout from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Copy, Loader2, Wallet, ArrowLeft, Clock, CheckCircle2, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { createSubscription } from "@/lib/subscriptionService";

const TRON_ADDRESS = "TPjzTWrVqDpwWrnCRgmKJ1J9uRfkESpAgb";

type PaymentStatus = "pending" | "verifying" | "success" | "error";

export default function CryptoPaymentPage() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const amount = searchParams.get("amount") || "50";
  const plan = searchParams.get("plan") || "pro";
  
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<PaymentStatus>("pending");
  const [countdown, setCountdown] = useState(1800); // 30 minutes
  const [confirmPayment, setConfirmPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const copyAddress = () => {
    navigator.clipboard.writeText(TRON_ADDRESS);
    setCopied(true);
    toast.success("تم نسخ العنوان");
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle payment confirmation and database update
  useEffect(() => {
    if (!confirmPayment || !user) return;

    const processPayment = async () => {
      setStatus("verifying");
      
      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create subscription in database
      const durationDays = plan === "enterprise" ? 30 : 30;
      const result = await createSubscription(user.id, plan, durationDays);
      
      if (result.success) {
      setStatus("success");
      
      // Show success notification
      toast.success("🎉 تم تفعيل اشتراكك بنجاح!", {
        description: `مرحباً بك في خطة ${getPlanName(plan)}`,
        duration: 5000,
      });
      
      // Refresh user data to update subscription status
      await refreshProfile();
      } else {
        setStatus("error");
        setErrorMessage(result.error || "حدث خطأ أثناء تفعيل الاشتراك");
        toast.error("حدث خطأ", {
          description: result.error,
        });
      }
    };

    processPayment();
  }, [confirmPayment, user, plan]);

  // Countdown timer
  useEffect(() => {
    if (status !== "pending" || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [status, countdown]);

  const formatCountdown = () => {
    const mins = Math.floor(countdown / 60);
    const secs = countdown % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getPlanName = (planId: string) => {
    switch (planId) {
      case "pro": return "Nexus Pro";
      case "enterprise": return "باقة الشركات";
      default: return "Pro";
    }
  };

  if (status === "success") {
    return (
      <MobileLayout hideNav>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-screen">
          <div className="w-28 h-28 rounded-full bg-success/20 flex items-center justify-center mb-6 animate-bounce">
            <PartyPopper className="w-14 h-14 text-success" />
          </div>
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            مبروك! 🎉
          </h1>
          <p className="text-xl font-medium mb-2">تم الدفع بنجاح</p>
          <p className="text-muted-foreground mb-8">
            تم ترقية حسابك إلى خطة <span className="text-primary font-bold">{getPlanName(plan)}</span>
          </p>
          
          <div className="glass-card rounded-2xl p-4 mb-8 w-full max-w-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">المبلغ المدفوع</span>
              <span className="font-bold text-primary">${amount} USDT</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">مدة الاشتراك</span>
              <span className="font-medium">30 يوم</span>
            </div>
          </div>
          
          <Button onClick={() => navigate("/home")} className="w-full max-w-xs h-12 text-lg">
            ابدأ الاستخدام
          </Button>
        </div>
      </MobileLayout>
    );
  }

  if (status === "error") {
    return (
      <MobileLayout>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 rounded-full bg-destructive/20 flex items-center justify-center mb-6">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">حدث خطأ</h1>
          <p className="text-muted-foreground mb-8">{errorMessage}</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStatus("pending")}>
              إعادة المحاولة
            </Button>
            <Button onClick={() => navigate("/subscription")}>
              العودة للاشتراكات
            </Button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 flex items-center gap-3 border-b border-border/50">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">الدفع بالعملات المشفرة</h1>
            <p className="text-xs text-muted-foreground">USDT - TRC20</p>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-6">
          {/* Amount Card */}
          <Card className="glass-card p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">المبلغ المطلوب</p>
            <p className="text-4xl font-bold text-primary">${amount}</p>
            <p className="text-xs text-muted-foreground mt-2">USDT (TRC20)</p>
          </Card>

          {/* Wallet Address */}
          <Card className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-5 h-5 text-primary" />
              <span className="font-medium">عنوان المحفظة (Tron TRC20)</span>
            </div>
            
            <div className="bg-background/50 rounded-lg p-3 break-all font-mono text-sm mb-3">
              {TRON_ADDRESS}
            </div>
            
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={copyAddress}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-success" />
                  تم النسخ
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  نسخ العنوان
                </>
              )}
            </Button>
          </Card>

          {/* QR Code Placeholder */}
          <Card className="glass-card p-6 flex flex-col items-center">
            <div className="w-48 h-48 bg-white rounded-lg p-2 mb-4">
              <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 rounded flex items-center justify-center">
                <div className="text-center">
                  <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">QR Code</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              امسح الكود أو انسخ العنوان لإتمام الدفع
            </p>
          </Card>

          {/* Timer */}
          {status === "pending" && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="text-sm">صالح لمدة: {formatCountdown()}</span>
            </div>
          )}

          {/* Status */}
          {status === "verifying" && (
            <Card className="glass-card p-4 flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span>جاري التحقق من الدفع وتفعيل الاشتراك...</span>
            </Card>
          )}

          {/* Instructions */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">تعليمات:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>أرسل بالضبط ${amount} USDT</li>
              <li>استخدم شبكة TRC20 فقط</li>
              <li>انتظر تأكيد الشبكة (1-5 دقائق)</li>
              <li>اضغط على "تأكيد الدفع" بعد الإرسال</li>
            </ul>
          </div>

          {/* Confirm Button */}
          <Button 
            className="w-full h-12 text-lg"
            disabled={status === "verifying"}
            onClick={() => setConfirmPayment(true)}
          >
            {status === "verifying" ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin ml-2" />
                جاري التحقق...
              </>
            ) : (
              "تأكيد الدفع"
            )}
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
