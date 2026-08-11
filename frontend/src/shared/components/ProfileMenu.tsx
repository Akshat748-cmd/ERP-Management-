import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Settings2, User, Shield, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const roleColors: Record<string, string> = {
  super_admin:  'bg-purple-100 text-purple-700',
  chairman:     'bg-amber-100 text-amber-700',
  principal:    'bg-blue-100 text-blue-700',
  school_admin: 'bg-slate-100 text-slate-700',
  teacher:      'bg-emerald-100 text-emerald-700',
  accountant:   'bg-teal-100 text-teal-700',
  student:      'bg-orange-100 text-orange-700',
  parent:       'bg-pink-100 text-pink-700',
  reception:    'bg-cyan-100 text-cyan-700',
};

const avatarColors: Record<string, string> = {
  super_admin:  'bg-purple-600',
  chairman:     'bg-amber-600',
  principal:    'bg-blue-700',
  school_admin: 'bg-slate-700',
  teacher:      'bg-emerald-700',
  accountant:   'bg-teal-700',
  student:      'bg-orange-600',
  parent:       'bg-pink-600',
  reception:    'bg-cyan-600',
};

export const ProfileMenu: React.FC<ProfileMenuProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const avatarBg = avatarColors[user?.role ?? ''] ?? 'bg-slate-700';
  const roleBadge = roleColors[user?.role ?? ''] ?? 'bg-slate-100 text-slate-700';
  const roleLabel = user?.role?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) ?? 'User';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.96, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: -4 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="absolute right-0 top-full mt-2 w-[260px] bg-white rounded-2xl shadow-xl border border-slate-200/80 z-[60] overflow-hidden"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)' }}
        >
          {/* Profile Header */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${avatarBg} flex items-center justify-center text-white font-bold text-[15px] shrink-0`}>
                {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-slate-900 truncate">{user?.name ?? 'User'}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email ?? ''}</p>
              </div>
            </div>
            <div className="mt-2.5">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${roleBadge}`}>
                <Shield className="w-2.5 h-2.5" />
                {roleLabel}
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1.5">
            <button
              onClick={() => { navigate('/portal/settings'); onClose(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-[13px] text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors group"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                <Settings2 className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <span className="flex-1">Settings</span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
            </button>

            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-[13px] text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors group"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                <User className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <span className="flex-1">Profile</span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
            </button>
          </div>

          {/* Divider */}
          <div className="mx-3 border-t border-slate-100" />

          {/* Logout */}
          <div className="py-1.5">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-[13px] text-red-600 hover:bg-red-50 transition-colors group"
            >
              <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                <LogOut className="w-3.5 h-3.5 text-red-500" />
              </div>
              <span>Sign out</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
