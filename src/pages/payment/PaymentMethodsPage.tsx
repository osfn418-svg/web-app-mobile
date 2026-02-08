import { useNavigate, useSearchParams } from "react-router-dom";
import MobileLayout from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, CreditCard, Wallet, ChevronRight, Shield, Zap, Crown } from "lucide-react";

const paymentMethods = [
  {
    id: "crypto",
    name: "العملات المشفرة",
    description: "USDT - TRC20 (Tron)",
    icon: Wallet,
    path: "/payment/crypto",
    badge: "سريع",
    color: "from-orange-500 to-yellow-500",
  },
  {
    id: "card",
    name: "البطاقة البنكية",
    description: "Visa / Mastercard",
    icon: CreditCard,
    path: "/payment/card",
    badge: "آمن",
    color: "from-blue-500 to-cyan-500",
  },
];

const plans = [
  { id: "pro", name: "Pro", price: 29, features: ["جميع الأدوات", "دعم أولوية", "بدون إعلانات"] },
  { id: "premium", name: "Premium", price: 49, features: ["كل مميزات Pro", "API Access", "تخزين غير محدود"] },
  { id: "enterprise", name: "Enterprise", price: 99, features: ["كل مميزات Premium", "دعم مخصص", "SLA"] },
];

export default function PaymentMethodsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get("plan") || "pro";
  
  const plan = plans.find(p => p.id === selectedPlan) || plans[0];

  return (
    <MobileLayout>
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 flex items-center gap-3 border-b border-border/50">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">اختر طريقة الدفع</h1>
            <p className="text-xs text-muted-foreground">خطة {plan.name}</p>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-6">
          {/* Selected Plan Summary */}
          <Card className="glass-card p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">اشتراك شهري</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">${plan.price}</p>
                <p className="text-xs text-muted-foreground">/شهر</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/50">
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Payment Methods */}
          <div className="space-y-3">
            <h2 className="font-semibold text-lg">طرق الدفع المتاحة</h2>
            
            {paymentMethods.map((method) => (
              <Card
                key={method.id}
                className="glass-card p-4 cursor-pointer hover:border-primary/50 transition-all active:scale-[0.98]"
                onClick={() => navigate(`${method.path}?plan=${plan.id}&amount=${plan.price}`)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center shadow-lg`}>
                    <method.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{method.name}</h3>
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        {method.badge}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Card>
            ))}
          </div>

          {/* Security Notice */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 rounded-xl p-4">
            <Shield className="w-8 h-8 text-green-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">دفع آمن 100%</p>
              <p className="text-xs">جميع المعاملات مشفرة ومحمية</p>
            </div>
          </div>

          {/* Plan Selection */}
          <div className="space-y-3">
            <h2 className="font-semibold">خطط أخرى</h2>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {plans.filter(p => p.id !== plan.id).map((p) => (
                <Button
                  key={p.id}
                  variant="outline"
                  className="flex-shrink-0"
                  onClick={() => navigate(`/payment?plan=${p.id}`)}
                >
                  {p.name} - ${p.price}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
