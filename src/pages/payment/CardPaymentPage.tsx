import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MobileLayout from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CreditCard, Lock, Loader2, CheckCircle2, Shield, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { createSubscription } from "@/lib/subscriptionService";

type PaymentStatus = "form" | "processing" | "success" | "error";

export default function CardPaymentPage() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const amount = searchParams.get("amount") || "50";
  const plan = searchParams.get("plan") || "pro";
  
  const [status, setStatus] = useState<PaymentStatus>("form");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [processingStep, setProcessingStep] = useState(0);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const getPlanName = (planId: string) => {
    switch (planId) {
      case "pro": return "Nexus Pro";
      case "enterprise": return "باقة الشركات";
      default: return "Pro";
    }
  };

  // Processing animation
  useEffect(() => {
    if (status !== "processing") return;

    const steps = [
      { delay: 1000, step: 1 },
      { delay: 2500, step: 2 },
      { delay: 4000, step: 3 },
    ];

    const timers = steps.map(({ delay, step }) =>
      setTimeout(() => setProcessingStep(step), delay)
    );

    return () => timers.forEach(clearTimeout);
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardNumber || !expiry || !cvv || !name) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    if (!user) {
      toast.error("يرجى تسجيل الدخول أولاً");
      return;
    }

    setStatus("processing");
    setProcessingStep(0);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 4500));
    
    // Create subscription in database
    const durationDays = 30;
    const result = await createSubscription(user.id, plan, durationDays);
    
    if (result.success) {
      setStatus("success");
      
      // Show success notification
      toast.success("🎉 تم تفعيل اشتراكك بنجاح!", {
        description: `مرحباً بك في خطة ${getPlanName(plan)}`,
        duration: 5000,
      });
      
      // Refresh user data
      await refreshProfile();
    } else {
      setStatus("error");
      setErrorMessage(result.error || "حدث خطأ أثناء معالجة الدفع");
      toast.error("حدث خطأ", {
        description: result.error,
      });
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
              <span className="font-bold text-primary">${amount}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">البطاقة</span>
              <span className="font-mono">•••• {cardNumber.slice(-4)}</span>
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
          <h1 className="text-2xl font-bold mb-2">فشل في معالجة الدفع</h1>
          <p className="text-muted-foreground mb-8">{errorMessage}</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStatus("form")}>
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

  if (status === "processing") {
    return (
      <MobileLayout hideNav>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-screen">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-6">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
          <h1 className="text-xl font-bold mb-2">جاري معالجة الدفع...</h1>
          <p className="text-muted-foreground">يرجى الانتظار وعدم إغلاق الصفحة</p>
          
          <div className="mt-8 space-y-3 w-full max-w-xs">
            <div className="flex items-center gap-3 text-sm">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${processingStep >= 1 ? 'bg-success' : 'bg-muted'}`}>
                {processingStep >= 1 ? <CheckCircle2 className="w-4 h-4 text-success-foreground" /> : <span className="text-xs">1</span>}
              </div>
              <span className={processingStep >= 1 ? 'text-foreground' : 'text-muted-foreground'}>التحقق من البيانات</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${processingStep >= 2 ? 'bg-success' : processingStep === 1 ? 'bg-primary animate-pulse' : 'bg-muted'}`}>
                {processingStep >= 2 ? <CheckCircle2 className="w-4 h-4 text-success-foreground" /> : processingStep === 1 ? <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" /> : <span className="text-xs">2</span>}
              </div>
              <span className={processingStep >= 1 ? 'text-foreground' : 'text-muted-foreground'}>الاتصال بالبنك</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${processingStep >= 3 ? 'bg-success' : processingStep === 2 ? 'bg-primary animate-pulse' : 'bg-muted'}`}>
                {processingStep >= 3 ? <CheckCircle2 className="w-4 h-4 text-success-foreground" /> : processingStep === 2 ? <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" /> : <span className="text-xs">3</span>}
              </div>
              <span className={processingStep >= 2 ? 'text-foreground' : 'text-muted-foreground'}>تفعيل الاشتراك</span>
            </div>
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
            <h1 className="text-lg font-bold">الدفع بالبطاقة</h1>
            <p className="text-xs text-muted-foreground">Visa / Mastercard</p>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-6">
          {/* Amount Card */}
          <Card className="glass-card p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">المبلغ المطلوب</p>
            <p className="text-4xl font-bold text-primary">${amount}</p>
            <p className="text-xs text-muted-foreground mt-2">USD</p>
          </Card>

          {/* Card Preview */}
          <div className="relative h-48 rounded-2xl bg-gradient-to-br from-primary/80 to-secondary/80 p-6 text-primary-foreground shadow-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-foreground/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <CreditCard className="w-10 h-10" />
                <div className="text-right text-xs opacity-80">
                  {getPlanName(plan)}
                </div>
              </div>
              
              <p className="font-mono text-lg tracking-wider mb-4">
                {cardNumber || "•••• •••• •••• ••••"}
              </p>
              
              <div className="flex justify-between">
                <div>
                  <p className="text-xs opacity-60">حامل البطاقة</p>
                  <p className="text-sm">{name || "YOUR NAME"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-60">تاريخ الانتهاء</p>
                  <p className="text-sm">{expiry || "MM/YY"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">رقم البطاقة</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">اسم حامل البطاقة</Label>
              <Input
                id="name"
                placeholder="الاسم كما هو على البطاقة"
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">تاريخ الانتهاء</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="password"
                  placeholder="•••"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  maxLength={4}
                />
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
              <Shield className="w-4 h-4 text-success" />
              <span>بياناتك محمية بتشفير SSL 256-bit</span>
            </div>

            <Button type="submit" className="w-full h-12 text-lg gap-2">
              <Lock className="w-5 h-5" />
              دفع ${amount}
            </Button>
          </form>
        </div>
      </div>
    </MobileLayout>
  );
}
