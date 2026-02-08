import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MobileLayout from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CreditCard, Lock, Loader2, CheckCircle2, Shield } from "lucide-react";
import { toast } from "sonner";

type PaymentStatus = "form" | "processing" | "success";

export default function CardPaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const amount = searchParams.get("amount") || "50";
  const plan = searchParams.get("plan") || "pro";
  
  const [status, setStatus] = useState<PaymentStatus>("form");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardNumber || !expiry || !cvv || !name) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    setStatus("processing");

    // Simulate payment processing
    setTimeout(() => {
      setStatus("success");
      toast.success("تم الدفع بنجاح!");
    }, 4000);
  };

  if (status === "success") {
    return (
      <MobileLayout>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-6 animate-pulse">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">تم الدفع بنجاح!</h1>
          <p className="text-muted-foreground mb-8">
            تم ترقية حسابك إلى خطة {plan === "pro" ? "Pro" : plan === "premium" ? "Premium" : "Enterprise"}
          </p>
          <Button onClick={() => navigate("/home")} className="w-full max-w-xs">
            العودة للرئيسية
          </Button>
        </div>
      </MobileLayout>
    );
  }

  if (status === "processing") {
    return (
      <MobileLayout>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-6">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
          <h1 className="text-xl font-bold mb-2">جاري معالجة الدفع...</h1>
          <p className="text-muted-foreground">يرجى الانتظار قليلاً</p>
          
          <div className="mt-8 space-y-3 w-full max-w-xs">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <span>التحقق من البيانات</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center animate-pulse">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
              <span>الاتصال بالبنك</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs">3</span>
              </div>
              <span>تأكيد العملية</span>
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
          <div className="relative h-48 rounded-2xl bg-gradient-to-br from-primary/80 to-secondary/80 p-6 text-white shadow-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <CreditCard className="w-10 h-10" />
                <div className="text-right text-xs opacity-80">
                  {plan === "pro" ? "Pro" : plan === "premium" ? "Premium" : "Enterprise"}
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
              <Shield className="w-4 h-4 text-green-500" />
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
