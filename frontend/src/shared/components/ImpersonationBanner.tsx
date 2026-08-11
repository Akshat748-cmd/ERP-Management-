import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, LogOut } from 'lucide-react';

export const ImpersonationBanner: React.FC = () => {
  const { user, impersonation, endImpersonation } = useAuth();

  if (!impersonation.active || !user) return null;

  return (
    <div className="bg-amber-600 text-white px-4 py-2 flex items-center justify-between shadow-md z-50 sticky top-0 text-sm font-medium border-b border-amber-700">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 animate-pulse text-amber-200" />
        <span>
          <strong>IMPERSONATION SESSION:</strong> Viewing portal as{' '}
          <span className="underline font-bold text-amber-100">{user.name}</span> ({user.role.toUpperCase()}) — Initiated by{' '}
          <strong>{impersonation.originalUser?.name || 'Super Admin'}</strong> (Super Admin)
        </span>
      </div>
      <button
        onClick={endImpersonation}
        className="flex items-center gap-1.5 bg-amber-900 hover:bg-amber-950 text-amber-100 font-semibold px-3 py-1 rounded-md transition-colors text-xs shadow-sm cursor-pointer"
      >
        <LogOut className="w-3.5 h-3.5" />
        Exit & Return to Super Admin
      </button>
    </div>
  );
};
