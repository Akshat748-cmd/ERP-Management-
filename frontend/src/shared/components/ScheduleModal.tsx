import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Modal } from './Modal';
import { Button } from './Button';
import { Calendar, Clock, Plus, MapPin, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { schedulesApi } from '@/services/api/endpoints';

export interface ScheduleItem {
  id: string;
  schoolId: string;
  className: string;
  subject: string;
  teacherName: string;
  timeSlot: string;
  roomNumber: string;
  dayOfWeek: string;
}

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');

  /* Add Slot State */
  const [isAdding, setIsAdding] = useState(false);
  const [className, setClassName] = useState('10');
  const [subject, setSubject] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [timeSlot, setTimeSlot] = useState('09:00 AM - 09:45 AM');
  const [roomNumber, setRoomNumber] = useState('Room 102');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      const res = await schedulesApi.list({ day: selectedDay });
      setSchedules(res.data || []);
    } catch (err) {
      console.error('Failed to load timetable:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSchedules();
    }
  }, [isOpen, selectedDay]);

  const handleAddSubmit = async () => {
    if (!subject.trim() || !teacherName.trim() || !className.trim()) {
      toast.error('Please fill in subject, class, and teacher name.');
      return;
    }
    setIsSubmitting(true);
    try {
      await schedulesApi.create({
        className: className.trim(),
        subject: subject.trim(),
        teacherName: teacherName.trim(),
        timeSlot: timeSlot.trim(),
        roomNumber: roomNumber.trim(),
        dayOfWeek: selectedDay,
      });
      toast.success('Timetable slot added successfully!');
      setSubject('');
      setTeacherName('');
      setIsAdding(false);
      fetchSchedules();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to add schedule slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Class Timetable & Daily Schedule"
      subtitle="View lecture periods, assigned teachers, time slots, and room allocations"
    >
      <div className="space-y-4 pt-2">
        {/* Day Selector Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-100">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedDay === day
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800">
              {selectedDay} Schedule ({schedules.length} Slots)
            </span>
          </div>

          {['super_admin', 'school_admin', 'principal'].includes(user?.role || '') && (
            <Button
              variant="accent"
              size="xs"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsAdding((prev) => !prev)}
            >
              {isAdding ? 'View Timetable' : 'Add Time Slot'}
            </Button>
          )}
        </div>

        {isAdding ? (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <p className="text-xs font-bold text-slate-900">Add Timetable Slot for {selectedDay}</p>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Class *</label>
                <input
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. 10"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Subject *</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Mathematics"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Teacher Name *</label>
                <input
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="e.g. Dr. Ramesh Sharma"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Time Slot *</label>
                <input
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  placeholder="e.g. 09:00 AM - 09:45 AM"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500/20 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Room Number *</label>
              <input
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. Room 204"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="xs" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button variant="accent" size="xs" onClick={handleAddSubmit} isLoading={isSubmitting}>
                Save Timetable Slot
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {isLoading ? (
              <p className="text-xs text-center py-6 text-slate-400">Loading daily schedule...</p>
            ) : schedules.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-400">No timetable periods scheduled for {selectedDay}.</p>
              </div>
            ) : (
              schedules.map((s) => (
                <div key={s.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900">{s.subject}</p>
                        <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">
                          Class {s.className}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1"><User className="w-3 h-3 text-slate-400" /> {s.teacherName}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {s.roomNumber}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-slate-700 font-mono bg-white px-3 py-1 rounded-xl border border-slate-200 shrink-0">
                    {s.timeSlot}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Timetable
          </Button>
        </div>
      </div>
    </Modal>
  );
};
