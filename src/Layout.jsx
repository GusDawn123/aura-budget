import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { LayoutDashboard, TrendingUp, TrendingDown, Receipt, PieChart, Settings as SettingsIcon, Wallet } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function Layout({ children, currentPageName }) {
  const navItems = [
    { name: 'Overview', icon: LayoutDashboard, page: 'Overview' },
    { name: 'Money In', icon: TrendingUp, page: 'MoneyIn' },
    { name: 'Money Out', icon: TrendingDown, page: 'MoneyOut' },
    { name: 'Bills', icon: Receipt, page: 'Bills' },
    { name: 'Snapshot', icon: PieChart, page: 'Snapshot' },
    { name: 'Settings', icon: SettingsIcon, page: 'Settings' },
  ];

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Gradient Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #0B1E2D 0%, #153A52 100%)',
          opacity: 0.85
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Top Navigation */}
        <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/[0.08] border-b border-white/[0.12]">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link to={createPageUrl('Overview')} className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#2CB1BC] shadow-lg">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-lg text-[#F7FAFC]">Moneena</span>
                  <p className="text-[#C9D4DF] text-xs leading-none">Easy Budget Planner</p>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                      currentPageName === item.page
                        ? "bg-white/[0.15] text-[#F7FAFC] shadow-sm"
                        : "text-[#C9D4DF] hover:bg-white/[0.08] hover:text-[#F7FAFC]"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>

              {/* Mobile Menu Button - Simple version showing current page */}
              <div className="md:hidden">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.15] text-[#F7FAFC] text-sm font-medium">
                  {navItems.find(item => item.page === currentPageName)?.icon && 
                    React.createElement(navItems.find(item => item.page === currentPageName).icon, { className: "w-4 h-4" })
                  }
                  <span>{currentPageName || 'Overview'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden border-t border-white/[0.12] px-2 py-2 grid grid-cols-3 gap-1">
            {navItems.map((item) => (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all",
                  currentPageName === item.page
                    ? "bg-white/[0.15] text-[#F7FAFC]"
                    : "text-[#C9D4DF] hover:bg-white/[0.08] hover:text-[#F7FAFC]"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-[10px]">{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}