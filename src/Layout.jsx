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
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="fixed inset-0 -z-10 w-screen h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-teal-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.2),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(14,165,233,0.2),transparent_40%)]" />
      </div>

      <div className="relative w-full">
        <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link to={createPageUrl('Overview')} className="font-bold text-2xl text-white bg-gradient-to-r from-purple-300 to-teal-300 bg-clip-text text-transparent">
                Moneena
              </Link>

              <div className="hidden md:flex items-center gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all transform hover:scale-105",
                      currentPageName === item.page
                        ? "bg-gradient-to-r from-purple-500/30 to-teal-500/30 text-white shadow-lg shadow-purple-500/20"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>

              <div className="md:hidden">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500/30 to-teal-500/30 text-white text-sm font-medium shadow-lg">
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
                  "flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-xs font-medium transition-all",
                  currentPageName === item.page
                    ? "bg-gradient-to-r from-purple-500/30 to-teal-500/30 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-[10px]">{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>

        <main className="pb-16">
          {children}
        </main>
      </div>
    </div>
  );
}