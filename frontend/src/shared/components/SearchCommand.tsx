import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, GraduationCap, Users, UserCheck, CalendarCheck, BookOpen, CreditCard, Award, BarChart3, Shield, Settings2, Globe, History, X, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchItem {
  label: string;
  description: string;
  path: string;
  icon: React.ElementType;
  group: string;
}

const ALL_ITEMS: SearchItem[] = [
  { label: 'Dashboard', description: 'Your main overview', path: '/portal/dashboard', icon: GraduationCap, group: 'Navigation' },
  { label: 'Students', description: 'Student directory & records', path: '/portal/students', icon: Users, group: 'Navigation' },
  { label: 'Teachers', description: 'Faculty management', path: '/portal/teachers', icon: UserCheck, group: 'Navigation' },
  { label: 'Attendance', description: 'Mark & view attendance', path: '/portal/attendance', icon: CalendarCheck, group: 'Navigation' },
  { label: 'Homework', description: 'Assignments & submissions', path: '/portal/homework', icon: BookOpen, group: 'Navigation' },
  { label: 'Fees & Accounts', description: 'Fee collection & management', path: '/portal/fees', icon: CreditCard, group: 'Navigation' },
  { label: 'Results & Marks', description: 'Grades & report cards', path: '/portal/results', icon: Award, group: 'Navigation' },
  { label: 'Analytics', description: 'Executive intelligence', path: '/portal/analytics', icon: BarChart3, group: 'Navigation' },
  { label: 'User Management', description: 'Roles & permissions', path: '/portal/users', icon: Shield, group: 'Admin' },
  { label: 'Audit Logs', description: 'Activity history', path: '/portal/audit-log', icon: History, group: 'Admin' },
  { label: 'School Settings', description: 'Configuration & profile', path: '/portal/settings', icon: Settings2, group: 'Admin' },
  { label: 'Platform Admin', description: 'Multi-tenant management', path: '/portal/platform', icon: Globe, group: 'Admin' },
];

interface SearchCommandProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchCommand: React.FC<SearchCommandProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query
    ? ALL_ITEMS.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      )
    : ALL_ITEMS;

  // Group results
  const groups = Array.from(new Set(filtered.map(i => i.group)));

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx(i => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        const item = filtered[activeIdx];
        if (item) {
          navigate(item.path);
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, filtered, activeIdx, navigate, onClose]);

  useEffect(() => { setActiveIdx(0); }, [query]);

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  let itemCounter = 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-slate-900/60"
            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl z-10 overflow-hidden"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.1)' }}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search pages, actions…"
                className="flex-1 text-[14px] text-slate-800 placeholder-slate-400 outline-none bg-transparent"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="w-5 h-5 rounded-full flex items-center justify-center bg-slate-200 text-slate-500 hover:bg-slate-300 shrink-0"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-slate-100 rounded border border-slate-200">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[380px] overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-[13px] text-slate-400">No results for "<span className="font-medium text-slate-600">{query}</span>"</p>
                </div>
              ) : (
                groups.map(group => {
                  const groupItems = filtered.filter(i => i.group === group);
                  return (
                    <div key={group}>
                      <p className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        {group}
                      </p>
                      {groupItems.map(item => {
                        const Icon = item.icon;
                        const idx = itemCounter++;
                        const isActive = idx === activeIdx;
                        return (
                          <button
                            key={item.path}
                            onMouseEnter={() => setActiveIdx(idx)}
                            onClick={() => handleSelect(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                              isActive ? 'bg-slate-100' : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                            }`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium text-slate-800 truncate">{item.label}</p>
                              <p className="text-[11px] text-slate-400 truncate">{item.description}</p>
                            </div>
                            {isActive && <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-3 text-[10px] text-slate-400">
                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px]">↑↓</kbd> Navigate</span>
                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px]">↵</kbd> Open</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <Command className="w-3 h-3" />
                <span>K to open</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
