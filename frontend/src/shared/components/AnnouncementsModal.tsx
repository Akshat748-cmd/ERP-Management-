import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Modal } from './Modal';
import { Button } from './Button';
import { Megaphone, Plus, Trash2, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { announcementsApi } from '@/services/api/endpoints';

export interface AnnouncementItem {
  id: string;
  schoolId: string;
  title: string;
  content: string;
  targetAudience: string;
  postedByUserId: string;
  createdAt: string;
}

interface AnnouncementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnnouncementsModal: React.FC<AnnouncementsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /* Post New Announcement State */
  const [isPosting, setIsPosting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const res = await announcementsApi.list();
      setAnnouncements(res.data || []);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAnnouncements();
    }
  }, [isOpen]);

  const handlePostSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Please enter both a title and notice content.');
      return;
    }
    setIsSubmitting(true);
    try {
      await announcementsApi.create({
        title: title.trim(),
        content: content.trim(),
        targetAudience,
      });
      toast.success('Announcement broadcasted to notice board!');
      setTitle('');
      setContent('');
      setIsPosting(false);
      fetchAnnouncements();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to post announcement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await announcementsApi.remove(id);
      toast.success('Announcement removed.');
      fetchAnnouncements();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to delete announcement.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="School Notice Board & Broadcasts"
      subtitle="Official announcements, circulars, and institutional alerts"
    >
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-bold text-slate-800">
              Active Alerts ({announcements.length})
            </span>
          </div>

          {['super_admin', 'school_admin', 'principal', 'teacher'].includes(user?.role || '') && (
            <Button
              variant="accent"
              size="xs"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsPosting((prev) => !prev)}
            >
              {isPosting ? 'View Notices' : 'Post Announcement'}
            </Button>
          )}
        </div>

        {isPosting ? (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <p className="text-xs font-bold text-slate-900">Create New Announcement</p>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Notice Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Annual Sports Meet 2026 Schedule"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Target Audience *</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 capitalize"
              >
                <option value="all">Everyone (All Roles)</option>
                <option value="teachers">Teachers Only</option>
                <option value="students">Students Only</option>
                <option value="parents">Parents Only</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Notice Content *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="Enter notice details, instructions, or dates..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="xs" onClick={() => setIsPosting(false)}>
                Cancel
              </Button>
              <Button variant="accent" size="xs" onClick={handlePostSubmit} isLoading={isSubmitting}>
                Broadcast Alert
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {isLoading ? (
              <p className="text-xs text-center py-6 text-slate-400">Loading notice board...</p>
            ) : announcements.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <Megaphone className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-400">No active announcements posted.</p>
              </div>
            ) : (
              announcements.map((a) => (
                <div key={a.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <p className="text-xs font-bold text-slate-900">{a.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                        {a.targetAudience}
                      </span>
                      {['super_admin', 'school_admin', 'principal'].includes(user?.role || '') && (
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                          title="Delete notice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                    {a.content}
                  </p>

                  <p className="text-[10px] text-slate-400 font-mono">
                    Posted: {new Date(a.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Notice Board
          </Button>
        </div>
      </div>
    </Modal>
  );
};
