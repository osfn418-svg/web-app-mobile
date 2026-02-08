import { Home, Compass, Bookmark, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const navItems = [
  { icon: User, label: 'الحساب', path: '/profile' },
  { icon: Bookmark, label: 'محفوظات', path: '/saved' },
  { icon: Compass, label: 'استكشاف', path: '/explore' },
  { icon: Home, label: 'الرئيسية', path: '/home' },
];

export default function BottomNavigation() {
  const location = useLocation();

  return (
    <nav className="bottom-nav safe-bottom">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

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
