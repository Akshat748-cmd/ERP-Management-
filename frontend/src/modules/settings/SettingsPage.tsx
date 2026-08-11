import React, { useState, useEffect } from 'react';
import { SectionHeader, Card, CardHeader, CardBody, Button } from '@/shared/components';
import { useTenant } from '@/context/TenantContext';
import { Save, Check, Building2, Mail, Phone, MapPin, Calendar, Award } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { tenant } = useTenant();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    schoolName: '',
    tagline: 'Excellence in Education',
    affiliation: 'CBSE Affiliation #1730421',
    email: '',
    phone: '',
    address: '',
    academicYear: '2026-2027',
  });

  useEffect(() => {
    if (tenant) {
      setForm(prev => ({
        ...prev,
        schoolName: tenant.name || '',
        email: tenant.contactEmail || `contact@${tenant.domain || 'school.edu'}`,
        phone: tenant.contactPhone || '+91 141 2780192',
        address: tenant.address || 'Main Campus, Institutional Area',
      }));
    }
  }, [tenant]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="School Settings & Configuration"
        subtitle="Manage institution profile, official branding, academic session calendars, and administrative contact defaults."
        breadcrumb={[{ label: 'Administration' }, { label: 'School Settings' }]}
        action={
          <Button
            onClick={handleSave}
            variant={saved ? 'success' : 'accent'}
            size="sm"
            leftIcon={saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          >
            {saved ? 'Saved Successfully' : 'Save Changes'}
          </Button>
        }
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Profile Section Card */}
        <Card>
          <CardHeader
            title="Institutional Profile & Branding"
            subtitle="Public profile details displayed across student receipts, report cards, and official notices"
          />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                  School Institution Name
                </label>
                <input
                  value={form.schoolName}
                  onChange={e => setForm({ ...form, schoolName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-indigo-500" />
                  Institution Tagline
                </label>
                <input
                  value={form.tagline}
                  onChange={e => setForm({ ...form, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Board Affiliation No.
                </label>
                <input
                  value={form.affiliation}
                  onChange={e => setForm({ ...form, affiliation: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  Active Academic Year
                </label>
                <input
                  value={form.academicYear}
                  onChange={e => setForm({ ...form, academicYear: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 text-slate-800"
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Contact Information Section Card */}
        <Card>
          <CardHeader
            title="Official Administrative Contact"
            subtitle="Helpline email, phone numbers, and campus physical address"
          />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-500" />
                  Official Email Address
                </label>
                <input
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-indigo-500" />
                  Helpline Phone Number
                </label>
                <input
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 text-slate-800"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                  Campus Physical Address
                </label>
                <input
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 text-slate-800"
                />
              </div>
            </div>
          </CardBody>
        </Card>
      </form>
    </div>
  );
};
