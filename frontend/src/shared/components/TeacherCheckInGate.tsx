import React, { useState, useEffect, useCallback } from 'react';
import { teachersApi } from '@/services/api/endpoints';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2, Clock, LogIn, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface CheckInData {
  id: string;
  teacherName: string;
  date: string;
  status: string;
  checkInTime: string;
  alreadyCheckedIn: boolean;
}

interface TeacherCheckInGateProps {
  children: React.ReactNode;
}

const GATE_ROLES = ['teacher', 'principal', 'school_admin', 'chairman'];

export const TeacherCheckInGate: React.FC<TeacherCheckInGateProps> = ({ children }) => {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [checkInData, setCheckInData] = useState<CheckInData | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'present' | 'late'>('present');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsGate = user && GATE_ROLES.includes(user.role);

  const checkTodayStatus = useCallback(async () => {
    if (!needsGate) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await teachersApi.getTodayCheckIn();
      if (res.data) {
        setCheckInData(res.data as CheckInData);
      }
    } catch {
      // Not checked in yet
    } finally {
      setIsLoading(false);
    }
  }, [needsGate]);

  useEffect(() => {
    checkTodayStatus();
  }, [checkTodayStatus]);

  const handleCheckIn = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await teachersApi.checkIn({ status: selectedStatus, note: note.trim() || undefined });
      setCheckInData(res.data as CheckInData);
      toast.success(
        selectedStatus === 'present'
          ? 'Attendance marked - Present! Good morning!'
          : 'Late check-in recorded.'
      );
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to mark attendance. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-[9999]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (!needsGate || checkInData) {
    return <>{children}</>;
  }

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeNow = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const firstName = user?.name?.split(' ')[0] || 'Faculty';

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-6 text-white text-center">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <LogIn className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Staff Daily Check-In</h1>
          <p className="text-indigo-200 text-sm mt-1 font-medium">{today}</p>
          <p className="text-indigo-300 text-xs mt-0.5">Current Time: {timeNow}</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="text-center">
            <p className="text-white/80 text-sm leading-relaxed">
              Good {greeting},{' '}
              <span className="font-semibold text-white">{firstName}</span>!
            </p>
            <p className="text-white/50 text-xs mt-1">Please mark your attendance to access the portal.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedStatus('present')}
              className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all font-semibold text-sm ${
                selectedStatus === 'present'
                  ? 'border-emerald-400 bg-emerald-400/15 text-emerald-300 shadow-lg shadow-emerald-500/10'
                  : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70'
              }`}
            >
              <CheckCircle2 className={`w-8 h-8 ${selectedStatus === 'present' ? 'text-emerald-400' : 'text-white/30'}`} />
              Present
              <span className="text-xs font-normal opacity-70">On time</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatus('late')}
              className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all font-semibold text-sm ${
                selectedStatus === 'late'
                  ? 'border-amber-400 bg-amber-400/15 text-amber-300 shadow-lg shadow-amber-500/10'
                  : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70'
              }`}
            >
              <Clock className={`w-8 h-8 ${selectedStatus === 'late' ? 'text-amber-400' : 'text-white/30'}`} />
              Late
              <span className="text-xs font-normal opacity-70">Delayed arrival</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">
              Note (optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isSubmitting && handleCheckIn()}
              placeholder="e.g. Traffic delay, Medical appointment..."
              maxLength={120}
              className="w-full px-4 py-3 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleCheckIn}
            disabled={isSubmitting}
            className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              selectedStatus === 'present'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/25'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/25'
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {selectedStatus === 'present' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
                Mark {selectedStatus === 'present' ? 'Present' : 'Late'} &amp; Enter Portal
              </>
            )}
          </button>

          <p className="text-center text-white/25 text-[11px]">
            This check-in is recorded in the staff attendance register.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherCheckInGate;
