import React from 'react';
import { Breadcrumb } from './Breadcrumb';
import { Search, Sun, Moon } from 'lucide-react';

interface TopbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ darkMode, onToggleDarkMode }) => {
  const user = React.useMemo(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, []);

  const userName = user?.name || user?.email || 'Administrator';
  const initials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'AD';

  return (
    <header className="h-14 border-b border-border bg-surface sticky top-0 z-10 flex items-center justify-between px-5">
      {/* Left: Breadcrumb */}
      <Breadcrumb />

      {/* Right Controls */}
      <div className="flex items-center gap-3.5">
        {/* Global Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} strokeWidth={2} />
          <input
            type="text"
            placeholder="Cari global [Ctrl+K]..."
            className="w-[220px] h-8 pl-9 pr-3 text-[13px] bg-surface-subtle border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-600 font-sans"
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="h-8 w-8 flex items-center justify-center border border-border rounded-md bg-surface hover:bg-slate-50 dark:hover:bg-slate-800 text-text-secondary transition-colors shadow-sm"
          title="Toggle Theme"
        >
          {darkMode ? <Sun size={15} strokeWidth={2} /> : <Moon size={15} strokeWidth={2} />}
        </button>

        {/* User Pill / Profile */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-border">
          <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 text-text-primary font-semibold text-xs flex items-center justify-center select-none shadow-sm">
            {initials}
          </div>
          <span className="text-sm font-medium text-text-primary hidden md:inline">{userName}</span>
        </div>
      </div>
    </header>
  );
};
