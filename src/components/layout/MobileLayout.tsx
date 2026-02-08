import { ReactNode } from 'react';
import BottomNavigation from './BottomNavigation';
import QuickToolsMenu from '../ui/QuickToolsMenu';

interface MobileLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export default function MobileLayout({ children, hideNav = false }: MobileLayoutProps) {
  return (
    <div className="app-container bg-background min-h-screen" dir="rtl">
      <main className={`${hideNav ? '' : 'pb-24'} safe-top`}>
        {children}
      </main>
      {!hideNav && (
        <>
          <QuickToolsMenu />
          <BottomNavigation />
        </>
      )}
    </div>
  );
}
