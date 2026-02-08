import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, AlertCircle } from "lucide-react";
import NeonButton from "@/components/ui/NeonButton";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6" dir="rtl">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-destructive/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center"
        >
          <AlertCircle className="w-10 h-10 text-destructive" />
        </motion.div>

        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <h2 className="text-xl font-semibold text-foreground mb-2">الصفحة غير موجودة</h2>
        <p className="text-muted-foreground mb-8">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>

        <Link to="/home">
          <NeonButton className="gap-2">
            <Home className="w-5 h-5" />
            العودة للرئيسية
          </NeonButton>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
