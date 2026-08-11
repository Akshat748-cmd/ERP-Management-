import React from 'react';
import { UserPlus, CalendarCheck, BookPlus, CreditCard, Megaphone, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface QuickActionItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  path: string;
  color: string;
}

export const DEFAULT_QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: 'add-student',
    label: 'Add Student',
    description: 'Enrol new student',
    icon: UserPlus,
    path: '/portal/students',
    color: 'bg-blue-500 text-white hover:bg-blue-600',
  },
  {
    id: 'mark-attendance',
    label: 'Mark Attendance',
    description: 'Daily class register',
    icon: CalendarCheck,
    path: '/portal/attendance',
    color: 'bg-emerald-500 text-white hover:bg-emerald-600',
  },
  {
    id: 'create-homework',
    label: 'Create Homework',
    description: 'Assign classwork',
    icon: BookPlus,
    path: '/portal/homework',
    color: 'bg-purple-500 text-white hover:bg-purple-600',
  },
  {
    id: 'add-fee',
    label: 'Collect Fee',
    description: 'Record student payment',
    icon: CreditCard,
    path: '/portal/fees',
    color: 'bg-amber-500 text-white hover:bg-amber-600',
  },
  {
    id: 'announcements',
    label: 'Announcements',
    description: 'Notice board alert',
    icon: Megaphone,
    path: '/portal/analytics',
    color: 'bg-rose-500 text-white hover:bg-rose-600',
  },
  {
    id: 'schedule',
    label: "Today's Schedule",
    description: 'View class timetable',
    icon: Calendar,
    path: '/portal/dashboard',
    color: 'bg-indigo-500 text-white hover:bg-indigo-600',
  },
];

export const QuickActions: React.FC<{ actions?: QuickActionItem[] }> = ({
  actions = DEFAULT_QUICK_ACTIONS,
}) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-start p-4 bg-white rounded-2xl border border-slate-100/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left group cursor-pointer"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105 ${action.color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-[13px] font-semibold text-slate-800 leading-tight group-hover:text-slate-900">
              {action.label}
            </p>
            {action.description && (
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                {action.description}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
};
