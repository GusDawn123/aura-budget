import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { LayoutDashboard, CalendarClock, TrendingDown, TrendingUp, Settings as SettingsIcon } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function Layout({ children, currentPageName }) {
  const navItems = [
    { name: 'Overview', icon: LayoutDashboard, page: 'Overview' },
    { name: 'Upcoming', icon: CalendarClock, page: 'Upcoming' },
    { name: 'Expenses', icon: TrendingDown, page: 'Expenses' },
    { name: 'Income', icon: TrendingUp, page: 'Income' },
    { name: 'Settings', icon: SettingsIcon, page: 'Settings' },
  ];

  return (
    <div 
        className="min-h-screen relative"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-miNxJv_n8Nc?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div 
          className="fixed inset-0 pointer-events-none"
        />

      <div className="relative z-10">
        <nav className="sticky top-0 z-40 backdrop-blur-md bg-white/20 border-b border-white/30 shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link to={createPageUrl('Overview')} className="font-bold text-xl text-white">
                Moneena
              </Link>

              <div className="hidden md:flex items-center gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      currentPageName === item.page
                        ? "bg-white/20 text-white shadow-sm"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>

              <div className="md:hidden">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/20 text-white text-sm font-medium">
                  {navItems.find(item => item.page === currentPageName)?.icon && 
                    React.createElement(navItems.find(item => item.page === currentPageName).icon, { className: "w-4 h-4" })
                  }
                  <span>{currentPageName || 'Overview'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:hidden border-t border-white/30 px-2 py-2 grid grid-cols-5 gap-1">
            {navItems.map((item) => (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all",
                  currentPageName === item.page
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-[10px]">{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>

        <main className="pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}