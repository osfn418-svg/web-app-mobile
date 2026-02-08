import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MobileLayout from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Copy, Loader2, Wallet, ArrowLeft, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const TRON_ADDRESS = "TPjzTWrVqDpwWrnCRgmKJ1J9uRfkESpAgb";

type PaymentStatus = "pending" | "verifying" | "success";

export default function CryptoPaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const amount = searchParams.get("amount") || "50";
  const plan = searchParams.get("plan") || "pro";
  
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<PaymentStatus>("pending");
  const [countdown, setCountdown] = useState(30);
  const [confirmPayment, setConfirmPayment] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(TRON_ADDRESS);
    setCopied(true);
    toast.success("تم نسخ العنوان");
    setTimeout(() => setCopied(false), 2000);
  };

  // Simulate payment verification after user confirms
  useEffect(() => {
    if (!confirmPayment) return;

    setStatus("verifying");
    
    const timer = setTimeout(() => {
      setStatus("success");
      toast.success("تم التحقق من الدفع بنجاح!");
    }, 5000);

    return () => clearTimeout(timer);
  }, [confirmPayment]);

  // Countdown for pending status
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
                  <Check className="w-4 h-4 text-green-500" />
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
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded flex items-center justify-center">
                <div className="text-center">
                  <Wallet className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">QR Code</p>
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
              <span>جاري التحقق من الدفع...</span>
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
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
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
