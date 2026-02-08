import { Home, Compass, Bookmark, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const navItems = [
  { icon: User, label: 'الحساب', path: '/profile', isCenter: false },
  { icon: Bookmark, label: 'محفوظات', path: '/saved', isCenter: false },
  { icon: Home, label: 'الرئيسية', path: '/home', isCenter: true },
  { icon: Compass, label: 'استكشاف', path: '/explore', isCenter: false },
];

export default function BottomNavigation() {
  const location = useLocation();

  return (
    <nav className="bottom-nav safe-bottom">
      <div className="flex items-center justify-around relative">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center -mt-6"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-card border border-border text-foreground'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </motion.div>
                <span
                  className={`text-xs mt-1 transition-colors ${
                    isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center gap-1 py-2 px-4"
            >
              {isActive && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute -top-1 w-8 h-1 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
              <span
                className={`text-xs transition-colors ${
                  isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
