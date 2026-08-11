import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTenant } from '@/context/TenantContext';
import { apiClient } from '@/services/api/client';
import {
  Building2,
  Sparkles,
  Check,
  Copy,
  ExternalLink,
  ArrowRight,
  Globe,
  Lock,
  Mail,
  User,
  AlertTriangle,
  Download,
  FileText,
} from 'lucide-react';

import { getTenantGradient } from '@/config/theme';

interface RoleCredential {
  role: string;
  email: string;
  password: string;
}

export const SchoolRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { addTenant, switchTenant } = useTenant();
  const theme = getTenantGradient('default');

  const [form, setForm] = useState({
    schoolName: '',
    slug: '',
    adminName: '',
    adminEmail: '',
    password: '',
    logoUrl: '',
    phone: '',
    city: '',
  });

  const [createdResult, setCreatedResult] = useState<{
    schoolName: string;
    portalUrl: string;
    adminEmail: string;
    tenantId: string;
    credentials: RoleCredential[];
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedPwdMap, setCopiedPwdMap] = useState<Record<string, boolean>>({});

  // Auto generate slug from school name
  const handleNameChange = (name: string) => {
    const autoSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    setForm(f => ({
      ...f,
      schoolName: name,
      slug: f.slug || autoSlug,
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.schoolName || !form.adminEmail || !form.password) return;

    const tenantId = form.slug
      ? form.slug.toLowerCase().trim().replace(/\s+/g, '-')
      : form.schoolName.toLowerCase().replace(/[^a-z0-9]/g, '-');

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await apiClient.post('/tenants/register', {
        schoolName: form.schoolName,
        slug: tenantId,
        adminName: form.adminName || 'School Administrator',
        adminEmail: form.adminEmail,
        password: form.password,
        phone: form.phone,
        city: form.city,
        logoUrl: form.logoUrl,
      });

      const data = res.data;

      // Update TenantContext locally for immediate UI feedback
      const created = addTenant({
        id: data.tenantId,
        name: data.schoolName,
        code: data.tenantId.toUpperCase(),
        logoUrl: form.logoUrl || undefined,
        contactEmail: form.adminEmail,
        contactPhone: form.phone || undefined,
        address: form.city ? `${form.city}, India` : undefined,
      });

      const generatedLink = `${window.location.origin}/login?school=${created.id}`;

      setCreatedResult({
        schoolName: created.name,
        portalUrl: generatedLink,
        adminEmail: form.adminEmail,
        tenantId: created.id,
        credentials: data.credentials || [],
      });
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (createdResult) {
      navigator.clipboard.writeText(createdResult.portalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const copyAllCredentials = () => {
    if (!createdResult) return;
    let text = `=== SCHOOL CREDENTIALS SUMMARY ===\n`;
    text += `School: ${createdResult.schoolName}\n`;
    text += `Portal URL: ${createdResult.portalUrl}\n\n`;
    text += `ROLE CREDENTIALS:\n`;
    text += `--------------------------------------------------------\n`;
    createdResult.credentials.forEach((c) => {
      text += `Role: ${c.role.toUpperCase()}\nEmail: ${c.email}\nPassword: ${c.password}\n\n`;
    });
    text += `--------------------------------------------------------\n`;
    text += `Note: Users must change their password on first login.\n`;

    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const downloadCredentialsTxt = () => {
    if (!createdResult) return;
    let text = `=== SCHOOL CREDENTIALS SUMMARY ===\n`;
    text += `School: ${createdResult.schoolName}\n`;
    text += `Portal URL: ${createdResult.portalUrl}\n\n`;
    text += `ROLE CREDENTIALS:\n`;
    text += `--------------------------------------------------------\n`;
    createdResult.credentials.forEach((c) => {
      text += `Role: ${c.role.toUpperCase()}\nEmail: ${c.email}\nPassword: ${c.password}\n\n`;
    });
    text += `--------------------------------------------------------\n`;
    text += `Note: Users must change their password on first login.\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${createdResult.tenantId}-credentials.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copySinglePassword = (pwd: string, role: string) => {
    navigator.clipboard.writeText(pwd);
    setCopiedPwdMap((prev) => ({ ...prev, [role]: true }));
    setTimeout(() => {
      setCopiedPwdMap((prev) => ({ ...prev, [role]: false }));
    }, 2000);
  };

  const launchPortal = async () => {
    if (createdResult) {
      await switchTenant(createdResult.tenantId);
      navigate(`/login?school=${createdResult.tenantId}`);
    }
  };

  return (
    <div
      className="min-h-screen text-white flex flex-col justify-between p-4 sm:p-6 font-sans relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientVia} 60%, ${theme.gradientTo})`,
      }}
    >
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-maroon-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-3 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-[#0a192f] flex items-center justify-center font-bold text-sm">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide text-white">Multi-Tenant SaaS Engine</h1>
            <p className="text-[10px] text-amber-400 font-medium">Self-Service School Onboarding</p>
          </div>
        </div>
        <Link
          to="/login"
          className="text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors border border-white/10"
        >
          Sign In to Portal →
        </Link>
      </header>

      {/* Main Form Container */}
      <main className="max-w-2xl mx-auto w-full py-8 relative z-10">
        {!createdResult ? (
          <div className="bg-[#0f233d] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-[11px] font-bold border border-amber-500/20">
                <Sparkles className="w-3 h-3" /> Setup School Portal in 60 Seconds
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-serif">Register Your School</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Enter your institution details below. We will instantly generate a dedicated portal link and role credentials for your school.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              {/* School Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  School Name <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    required
                    value={form.schoolName}
                    onChange={e => handleNameChange(e.target.value)}
                    placeholder="e.g. Delhi Public School"
                    className="w-full pl-9 pr-3 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-medium"
                  />
                </div>
              </div>

              {/* Unique Slug / Link Preview */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Your Custom Portal Subdomain
                </label>
                <div className="relative flex items-center">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={form.slug}
                    onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="dps-school"
                    className="w-full pl-9 pr-28 py-2.5 bg-black/30 border border-white/10 rounded-xl text-amber-400 font-mono focus:outline-none focus:border-amber-400"
                  />
                  <span className="absolute right-3 text-[10px] font-mono text-slate-400 select-none">
                    .ampsportal.edu
                  </span>
                </div>
                {form.slug && (
                  <p className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Generated Link: {window.location.origin}/login?school={form.slug}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Admin Name */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Administrator Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      value={form.adminName}
                      onChange={e => setForm({ ...form, adminName: e.target.value })}
                      placeholder="Principal / Admin Name"
                      className="w-full pl-9 pr-3 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-medium"
                    />
                  </div>
                </div>

                {/* Admin Email */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Admin Email Address <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      type="email"
                      value={form.adminEmail}
                      onChange={e => setForm({ ...form, adminEmail: e.target.value })}
                      placeholder="admin@school.edu"
                      className="w-full pl-9 pr-3 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Create Admin Password <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    required
                    type="password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* City */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    City / Location
                  </label>
                  <input
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    placeholder="e.g. Jaipur, Rajasthan"
                    className="w-full px-3 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-medium"
                  />
                </div>

                {/* Logo URL */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Logo Image URL (Optional)
                  </label>
                  <input
                    value={form.logoUrl}
                    onChange={e => setForm({ ...form, logoUrl: e.target.value })}
                    placeholder="https://domain.com/logo.jpg"
                    className="w-full px-3 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 mt-2 bg-amber-500 hover:bg-amber-400 text-[#0a192f] font-bold rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Provisioning School Portal...' : 'Register & Generate School Link'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* SUCCESS SCREEN WITH CREDENTIALS TABLE */
          <div className="bg-[#0f233d] border border-emerald-500/30 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-5 text-center animate-scaleIn">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <Check className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-serif">School Portal Provisioned! 🎉</h2>
              <p className="text-xs text-slate-300">
                <strong>{createdResult.schoolName}</strong> is ready on the platform.
              </p>
            </div>

            {/* Warning Banner */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-left flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-amber-300">Save these credentials now — passwords won't be shown again.</p>
                <p className="text-[11px] text-slate-300">
                  Each role has been assigned a secure temporary password. Users will be prompted to change their password on first login.
                </p>
              </div>
            </div>

            {/* Dedicated Link Box */}
            <div className="bg-black/40 border border-amber-500/30 rounded-xl p-3.5 space-y-2 text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between">
                <span>School Access Link</span>
                <span className="text-emerald-400 text-[9.5px]">● Active</span>
              </p>
              <div className="flex items-center gap-2 bg-black/60 p-2 rounded-lg border border-white/10">
                <span className="font-mono text-xs text-amber-300 truncate flex-1">{createdResult.portalUrl}</span>
                <button
                  onClick={copyToClipboard}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors shrink-0 ${
                    copied ? 'bg-emerald-500 text-white' : 'bg-amber-500 hover:bg-amber-400 text-[#0a192f]'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>

            {/* Action Bar for Copy All / Download */}
            <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10 gap-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Generated Role Accounts ({createdResult.credentials.length})</span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={copyAllCredentials}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border border-white/10"
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedAll ? 'Copied All!' : 'Copy All as Text'}
                </button>
                <button
                  onClick={downloadCredentialsTxt}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-[#0a192f] rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download as .txt
                </button>
              </div>
            </div>

            {/* Credentials Table */}
            <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/60 text-[10px] uppercase font-bold text-slate-400 border-b border-white/10 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Email Address</th>
                    <th className="py-2.5 px-3">Temporary Password</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {createdResult.credentials.map((cred) => {
                    const isPwdCopied = !!copiedPwdMap[cred.role];
                    return (
                      <tr key={cred.role} className="hover:bg-white/5 transition-colors">
                        <td className="py-2 px-3 font-sans font-bold text-amber-300 capitalize">{cred.role.replace('_', ' ')}</td>
                        <td className="py-2 px-3 text-slate-300 select-all">{cred.email}</td>
                        <td className="py-2 px-3 text-emerald-400 font-bold select-all">{cred.password}</td>
                        <td className="py-2 px-3 text-right">
                          <button
                            onClick={() => copySinglePassword(cred.password, cred.role)}
                            className="p-1 text-slate-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1 rounded hover:bg-white/10"
                            title="Copy Password"
                          >
                            {isPwdCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Launch Action */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setCreatedResult(null)}
                className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 text-slate-200 font-bold rounded-xl text-xs transition-colors"
              >
                Register Another School
              </button>
              <button
                onClick={launchPortal}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-[#0a192f] font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg font-sans"
              >
                Launch Portal Now <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-slate-500 py-3 relative z-10">
        © 2026 Multi-Tenant SaaS Engine. All rights reserved.
      </footer>
    </div>
  );
};
