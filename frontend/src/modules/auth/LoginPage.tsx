import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import { SchoolLogo } from '@/shared/components';
import { notificationService } from '@/services/notifications/notificationService';
import { apiClient } from '@/services/api/client';
import {
  ShieldCheck,
  Crown,
  Settings,
  GraduationCap,
  BookOpen,
  UserCheck,
  Users,
  CreditCard,
  Eye,
  EyeOff,
  Bell,
  BarChart3,
  KeyRound,
  Sparkles,
  ChevronDown,
  Check,
  Building2,
  ArrowRight,
} from 'lucide-react';

interface RoleOption {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  emailTemplate: string;
  roleKey: string;
}

const ROLES: RoleOption[] = [
  {
    id: 'superadmin',
    title: 'Super Administrator',
    subtitle: 'System-wide control & tenant provisioning',
    icon: ShieldCheck,
    emailTemplate: 'superadmin@school.edu',
    roleKey: 'super_admin',
  },
  {
    id: 'chairman',
    title: 'Chairman / Board',
    subtitle: 'High-level executive overview & analytics',
    icon: Crown,
    emailTemplate: 'chairman@school.edu',
    roleKey: 'chairman',
  },
  {
    id: 'admin',
    title: 'School Administrator',
    subtitle: 'Full campus operations, staff & settings',
    icon: Settings,
    emailTemplate: 'admin@school.edu',
    roleKey: 'school_admin',
  },
  {
    id: 'principal',
    title: 'Principal',
    subtitle: 'Academic oversight, approvals & reports',
    icon: GraduationCap,
    emailTemplate: 'principal@school.edu',
    roleKey: 'principal',
  },
  {
    id: 'teacher',
    title: 'Faculty / Teacher',
    subtitle: 'Classroom management, attendance & marks',
    icon: BookOpen,
    emailTemplate: 'teacher@school.edu',
    roleKey: 'teacher',
  },
  {
    id: 'student',
    title: 'Student',
    subtitle: 'Access timetable, homework & report card',
    icon: UserCheck,
    emailTemplate: 'student@school.edu',
    roleKey: 'student',
  },
  {
    id: 'parent',
    title: 'Parent / Guardian',
    subtitle: "Monitor child's progress, fees & attendance",
    icon: Users,
    emailTemplate: 'parent@school.edu',
    roleKey: 'parent',
  },
  {
    id: 'accountant',
    title: 'Accountant',
    subtitle: 'Fee collection, receipts & financial reports',
    icon: CreditCard,
    emailTemplate: 'accountant@school.edu',
    roleKey: 'accountant',
  },
];

export const LoginPage: React.FC = () => {
  const { tenant, tenants, switchTenant, isLoadingTenant } = useTenant();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<RoleOption>(ROLES[2]); // Default Administrator
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);
  const [schoolSearch, setSchoolSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const tenantDomain = tenant?.domain || (tenant?.id ? `${tenant.id}.edu` : 'school.edu');
  const getRoleEmail = (role: RoleOption) => {
    if (role.roleKey === 'super_admin') {
      return 'superadmin@amps.edu';
    }
    return role.emailTemplate.replace('@school.edu', `@${tenantDomain}`);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const activeEmail = getRoleEmail(selectedRole);
    try {
      await login({ email: activeEmail, password, role: selectedRole.roleKey as any });
      navigate('/portal/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const SelectedIcon = selectedRole.icon;

  const schoolRoles = ROLES.filter((r) => r.roleKey !== 'super_admin');

  const roleCategories = [
    {
      category: 'Administrative & Leadership',
      roles: schoolRoles.filter((r) => ['chairman', 'school_admin', 'principal'].includes(r.roleKey)),
    },
    {
      category: 'Academics & Students',
      roles: schoolRoles.filter((r) => ['teacher', 'student'].includes(r.roleKey)),
    },
    {
      category: 'Accounts & Finance',
      roles: schoolRoles.filter((r) => ['accountant'].includes(r.roleKey)),
    },
    {
      category: 'Parents & Guardians',
      roles: schoolRoles.filter((r) => ['parent'].includes(r.roleKey)),
    },
  ];

  const filteredTenants = tenants.filter((t) =>
    t.name.toLowerCase().includes(schoolSearch.toLowerCase()) ||
    t.code.toLowerCase().includes(schoolSearch.toLowerCase()) ||
    t.id.toLowerCase().includes(schoolSearch.toLowerCase())
  );

  const theme = tenant?.theme;
  const gradientBg = theme
    ? `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientVia} 60%, ${theme.gradientTo})`
    : 'linear-gradient(135deg, #0F1D33, #1a2e4a 60%, #800000)';

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-10 selection:bg-white/30 selection:text-white"
      style={{ background: gradientBg }}
    >
      {/* Ambient glow orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20" style={{ background: 'rgba(255,255,255,0.15)' }} />
      <div className="fixed bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-15" style={{ background: 'rgba(255,255,255,0.10)' }} />

      {/* Central Split Container */}
      <div
        className="w-full max-w-5xl rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12"
        style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(2px)', border: '1px solid rgba(255,255,255,0.15)' }}
      >

        {/* Left Side: Gradient Glass Emblem Panel */}
        <div
          className="lg:col-span-5 text-white p-5 sm:p-6 lg:p-10 flex flex-col justify-between relative overflow-hidden"
          style={{ background: 'rgba(0,0,0,0.20)', backdropFilter: 'blur(12px)', borderRight: '1px solid rgba(255,255,255,0.12)' }}
        >
          {/* School building bg image */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-luminosity scale-105 pointer-events-none"
            style={{ backgroundImage: "url('/school-building-1.jpg')" }}
          />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5))' }} />

          <div className="relative z-10 text-center flex flex-col items-center my-auto py-6">
            <div
              className="rounded-2xl p-1.5 mb-6 shadow-xl"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              <SchoolLogo
                logoUrl={selectedRole.roleKey === 'super_admin' ? undefined : tenant?.logoUrl}
                altText={selectedRole.roleKey === 'super_admin' ? 'AMPS Platform' : (tenant?.name || 'School Logo')}
                size="xl"
                className="w-24 h-24"
              />
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-white leading-snug max-w-xs drop-shadow-lg">
              {selectedRole.roleKey === 'super_admin' ? 'AMPS SaaS Platform' : (tenant?.name || 'School Management Portal')}
            </h1>
            <p className="font-cinzel text-sm font-bold tracking-widest text-white/70 uppercase mt-2">
              {selectedRole.roleKey === 'super_admin'
                ? 'GLOBAL PLATFORM CONTROL'
                : (tenant?.code ? `${tenant.code} ADMINISTRATION PORTAL` : 'ADMINISTRATION PORTAL')}
            </p>
            <div className="w-16 h-0.5 my-6 rounded-full opacity-50" style={{ background: 'rgba(255,255,255,0.5)' }} />
          </div>

          <div className="relative z-10 hidden sm:block space-y-3 pt-4 text-xs text-white/70" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            <div className="flex items-center space-x-3">
              <KeyRound className="w-4 h-4 text-white/60 shrink-0" />
              <span>256-bit bcrypt encrypted sessions</span>
            </div>
            <div className="flex items-center space-x-3">
              <Bell className="w-4 h-4 text-white/60 shrink-0" />
              <span>Real-time inquiry notifications</span>
            </div>
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-4 h-4 text-white/60 shrink-0" />
              <span>Analytics and delivery tracking</span>
            </div>
          </div>
        </div>

        {/* Right Side: Frosted Glass Form */}
        <div
          className="lg:col-span-7 p-5 sm:p-8 lg:p-10 flex flex-col justify-between relative"
          style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)' }}
        >
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const saRole = ROLES.find((r) => r.roleKey === 'super_admin') || ROLES[0];
                setSelectedRole(saRole);
                switchTenant('platform');
                setPassword('superadmin');
              }}
              className="text-[11px] font-bold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-700" /> Super Admin Login
            </button>
            <Link
              to="/register-school"
              className="text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
            >
              <Building2 className="w-3.5 h-3.5" /> Register School →
            </Link>
          </div>

          {!tenant ? (
            /* STEP 1: SCHOOL SELECTION STEP */
            <div className="space-y-4 my-auto pt-6">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-[10px] font-bold font-mono tracking-widest text-[#C89D34] uppercase">
                  <Sparkles className="w-3.5 h-3.5 fill-[#C89D34]" />
                  <span>STEP 1: INSTITUTION SELECTION</span>
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1D33]">Select Your School</h2>
                <p className="text-xs text-slate-500">
                  Select your school portal below to sign in to your dedicated institution dashboard.
                </p>
              </div>

              {/* Searchable Combobox Filter */}
              <div className="relative">
                <input
                  type="text"
                  value={schoolSearch}
                  onChange={(e) => setSchoolSearch(e.target.value)}
                  placeholder="Search school by name, code or slug..."
                  className="w-full pl-3 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* School Cards Grid */}
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {isLoadingTenant ? (
                  <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                    Loading registered schools...
                  </div>
                ) : filteredTenants.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <p className="text-xs font-semibold text-slate-600">No matching school found</p>
                    <Link
                      to="/register-school"
                      className="inline-block text-xs font-bold text-amber-700 underline hover:text-amber-800"
                    >
                      Register your school on the platform now →
                    </Link>
                  </div>
                ) : (
                  filteredTenants.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => switchTenant(t.id)}
                      className="p-3 bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-amber-400 rounded-xl cursor-pointer transition-all flex items-center justify-between group shadow-xs hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <SchoolLogo logoUrl={t.logoUrl} altText={t.name} size="sm" className="w-10 h-10 rounded-lg shrink-0" />
                        <div>
                          <h3 className="text-xs font-bold text-[#0F1D33] group-hover:text-amber-800 transition-colors">
                            {t.name}
                          </h3>
                          <p className="text-[10px] text-slate-400 font-mono">
                            ID: <span className="text-amber-700 font-bold">{t.code || t.id}</span> · {t.domain || `${t.id}.ampsportal.edu`}
                          </p>
                        </div>
                      </div>
                      <button className="px-3 py-1.5 bg-[#0F1D33] group-hover:bg-amber-600 text-white font-bold text-[10.5px] rounded-lg transition-colors flex items-center gap-1 shrink-0">
                        Select →
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* STEP 2: ROLE & CREDENTIALS FORM */
            <div className="my-auto pt-6">
              {/* Selected School Header Bar with "Change School" Button */}
              <div className={`rounded-xl p-3 mb-4 flex items-center justify-between border ${selectedRole.roleKey === 'super_admin'
                ? 'bg-purple-50/90 border-purple-200/90'
                : 'bg-amber-50/80 border-amber-200/80'
                }`}>
                <div className="flex items-center gap-2.5">
                  <SchoolLogo
                    logoUrl={selectedRole.roleKey === 'super_admin' ? undefined : tenant?.logoUrl}
                    altText={selectedRole.roleKey === 'super_admin' ? 'AMPS Platform' : tenant?.name}
                    size="sm"
                    className="w-8 h-8 rounded-md shrink-0"
                  />
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-wider font-mono ${selectedRole.roleKey === 'super_admin' ? 'text-purple-800' : 'text-amber-800'
                      }`}>
                      {selectedRole.roleKey === 'super_admin' ? 'GLOBAL PLATFORM SCOPE' : 'ACTIVE PORTAL'}
                    </p>
                    <p className="text-xs font-bold text-[#0F1D33] leading-none">
                      {selectedRole.roleKey === 'super_admin' ? 'System-Wide SaaS Administration' : tenant?.name}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => switchTenant('')}
                  className="px-2.5 py-1 text-[10.5px] font-bold text-amber-900 hover:text-white bg-amber-200/80 hover:bg-amber-700 rounded-md transition-colors cursor-pointer border border-amber-300"
                >
                  Change School
                </button>
              </div>

              {/* Top Badge */}
              <div className="flex items-center space-x-2 text-[10px] sm:text-[11px] font-bold font-mono tracking-widest text-[#C89D34] uppercase mb-1">
                <Sparkles className="w-3.5 h-3.5 fill-[#C89D34]" />
                <span>SECURE SIGN IN</span>
              </div>

              {/* Title */}
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#0F1D33] tracking-tight">
                Select role and enter credentials
              </h2>

              {/* Role Grid Section */}
              <form onSubmit={handleLogin} className="mt-3 space-y-4">
                {/* Autocomplete username helper for Chrome */}
                <input
                  type="email"
                  name="username"
                  autoComplete="username"
                  value={getRoleEmail(selectedRole)}
                  readOnly
                  className="sr-only"
                  tabIndex={-1}
                />

                {/* Clean Role Selection Section */}
                <div className="relative" ref={dropdownRef}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                      ACCOUNT / PORTAL ROLE
                    </label>
                    <span className="text-[11px] font-semibold text-[#C89D34] bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                      {selectedRole.title} Selected
                    </span>
                  </div>

                  {/* Selected Role Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all duration-200 bg-white ${isDropdownOpen
                      ? 'border-[#C89D34] ring-2 ring-[#C89D34]/20 shadow-md'
                      : 'border-slate-200 hover:border-[#C89D34]/60 hover:bg-slate-50/50 shadow-xs'
                      }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="p-2 rounded-lg bg-[#0F1D33] text-[#C89D34] shrink-0 shadow-sm">
                        <SelectedIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-[#0F1D33] truncate">
                            {selectedRole.title}
                          </span>
                          <span className="text-[9.5px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-mono">
                            {getRoleEmail(selectedRole)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {selectedRole.subtitle}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2 shrink-0 text-slate-400">
                      <span className="hidden sm:inline-block text-[10.5px] font-semibold text-[#C89D34]">
                        Change
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#C89D34] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''
                          }`}
                      />
                    </div>
                  </button>

                  {/* Dropdown Menu Overlay */}
                  {isDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
                      {roleCategories.map((group, idx) => (
                        <div key={idx} className="p-2.5">
                          <div className="px-3 py-1 text-[10px] font-extrabold tracking-widest text-[#C89D34] uppercase font-mono bg-amber-50/50 rounded-lg mb-1">
                            {group.category}
                          </div>
                          <div className="space-y-1">
                            {group.roles.map((role) => {
                              const Icon = role.icon;
                              const isSelected = selectedRole.id === role.id;
                              return (
                                <button
                                  key={role.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedRole(role);
                                    setIsDropdownOpen(false);
                                    if (role.roleKey === 'super_admin') {
                                      setPassword('superadmin');
                                    } else {
                                      const cleanSchool = tenant?.id ? tenant.id.toLowerCase().replace(/[^a-z0-9]/g, '') : 'school';
                                      const cleanRole = role.roleKey.toLowerCase().replace(/[^a-z0-9]/g, '');
                                      setPassword(`${cleanRole}${cleanSchool}`);
                                    }
                                  }}
                                  className={`w-full p-2 rounded-xl text-left flex items-center justify-between transition-all ${isSelected
                                    ? 'bg-[#0F1D33] text-white shadow-md'
                                    : 'hover:bg-slate-100/80 text-slate-700'
                                    }`}
                                >
                                  <div className="flex items-center space-x-3 min-w-0">
                                    <div
                                      className={`p-2 rounded-lg shrink-0 ${isSelected
                                        ? 'bg-[#C89D34] text-navy-950'
                                        : 'bg-slate-100 text-slate-600'
                                        }`}
                                    >
                                      <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-xs font-bold truncate">
                                        {role.title}
                                      </div>
                                      <div
                                        className={`text-[11px] truncate ${isSelected ? 'text-amber-200/80' : 'text-slate-400'
                                          }`}
                                      >
                                        {role.subtitle}
                                      </div>
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <Check className="w-4 h-4 text-[#C89D34] shrink-0 ml-2" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-1.5">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#C89D34] focus:bg-white font-mono text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="mt-1.5 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setForgotEmail(getRoleEmail(selectedRole));
                        setDevResetUrl(null);
                        setShowForgotModal(true);
                      }}
                      className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors inline-block cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 text-white font-bold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                  style={{
                    background: theme
                      ? `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`
                      : '#0F1D33',
                  }}
                >
                  {isSubmitting ? 'Authenticating...' : `Sign In as ${selectedRole.title}`} <ArrowRight className="w-4 h-4 text-white/70" />
                </button>
              </form>
            </div>
          )}

          {/* Forgot Password Modal */}
          {showForgotModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-scaleIn">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-[#0F1D33] flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-amber-600" />
                    Reset Account Password
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-slate-600">
                  Enter your account email address. A password reset link will be generated for your account.
                </p>

                <div>
                  <label className="block text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-1">
                    ACCOUNT EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="user@school.edu"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                {devResetUrl && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-left text-xs">
                    <span className="font-bold text-amber-800 uppercase text-[10px] tracking-wider block">
                      [DEV MODE ONLY] Password Reset Link:
                    </span>
                    <Link
                      to={devResetUrl}
                      onClick={() => setShowForgotModal(false)}
                      className="text-amber-900 font-mono text-[11.5px] font-bold underline break-all hover:text-amber-700"
                    >
                      {window.location.origin}{devResetUrl}
                    </Link>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    disabled={forgotLoading || !forgotEmail}
                    onClick={async () => {
                      setForgotLoading(true);
                      try {
                        const res = await apiClient.post('/auth/forgot-password', { email: forgotEmail });
                        notificationService.success(res.data.message || 'Reset link generated successfully.');
                        if (res.data.resetUrl) {
                          setDevResetUrl(res.data.resetUrl);
                        }
                      } catch (err: any) {
                        notificationService.error(err.response?.data?.detail || err.message || 'Failed to send reset link.');
                      } finally {
                        setForgotLoading(false);
                      }
                    }}
                    className="flex-1 py-2 bg-[#0F1D33] hover:bg-[#162744] text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-50"
                  >
                    {forgotLoading ? 'Generating Link...' : 'Send Reset Link'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="mt-6 text-center pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}>
            <p className="text-[11px] text-slate-400 tracking-wide font-sans">
              Authorized personnel only &nbsp;·&nbsp; Session expires after 20 min inactivity
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
