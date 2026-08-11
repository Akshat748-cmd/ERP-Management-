import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import { SchoolLogo, NotificationBell, SearchCommand, ProfileMenu, ThemeSwitcher } from '@/shared/components';
import { ImpersonationBanner } from '@/shared/components/ImpersonationBanner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Users,
  UserCheck,
  CalendarCheck,
  BookOpen,
  CreditCard,
  Award,
  Shield,
  LogOut,
  Building2,
  Menu,
  X,
  BarChart3,
  Settings2,
  Globe,
  ChevronRight,
  History,
  Search,
  ChevronLeft,
  Crown,
  Calendar,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

export const PortalLayout: React.FC = () => {
  const { user, logout, hasPermission } = useAuth();
  const { schoolName, tenant, tenants, switchTenant } = useTenant();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [schoolDropOpen, setSchoolDropOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Global shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const isChairman = user?.role === 'chairman';
  const isSuperAdmin = user?.role === 'super_admin';

  // Navigation Items
  const navGroups = [
    {
      title: 'Core',
      items: [
        { label: 'Dashboard', path: '/portal/dashboard', icon: GraduationCap, show: true },
      ],
    },
    {
      title: 'Academics',
      items: [
        { label: 'Students', path: '/portal/students', icon: Users, show: hasPermission(['view_students', 'view_own_academic_record']) },
        { label: 'Teachers', path: '/portal/teachers', icon: UserCheck, show: hasPermission('view_teachers') },
        { label: 'Attendance', path: '/portal/attendance', icon: CalendarCheck, show: !isSuperAdmin && hasPermission(['mark_attendance', 'approve_attendance', 'view_attendance', 'view_own_attendance', 'view_child_attendance']) },
        { label: 'Homework', path: '/portal/homework', icon: BookOpen, show: !isSuperAdmin && hasPermission(['create_homework', 'grade_homework', 'view_homework', 'view_own_homework', 'view_child_homework', 'submit_homework']) },
        { label: 'Results', path: '/portal/results', icon: Award, show: !isSuperAdmin && hasPermission(['view_results', 'enter_results', 'publish_results', 'view_own_results', 'view_child_results']) },
      ],
    },
    {
      title: 'Finance',
      items: [
        { label: 'Fees & Accounts', path: '/portal/fees', icon: CreditCard, show: !isSuperAdmin && hasPermission(['view_fees', 'view_fees_summary', 'collect_fees', 'manage_fees', 'view_own_fees', 'view_child_fees']) },
      ],
    },
    {
      title: 'Administration',
      items: [
        { label: 'User Management', path: '/portal/users', icon: Shield, show: hasPermission('view_users') },
        { label: 'Audit Logs', path: '/portal/audit-log', icon: History, show: hasPermission('view_audit_logs') },
        { label: 'School Settings', path: '/portal/settings', icon: Settings2, show: !isSuperAdmin && hasPermission('manage_school_settings') },
      ],
    },
    {
      title: 'Platform',
      items: [
        { label: 'Analytics', path: '/portal/analytics', icon: BarChart3, show: hasPermission(['view_analytics', 'cross_school_analytics']) },
        { label: 'Platform Admin', path: '/portal/platform', icon: Globe, show: hasPermission('manage_tenants') },
      ],
    },
  ];

  // Flattened for breadcrumbs
  const allNavItems = navGroups.flatMap((g) => g.items);
  const currentPageItem = allNavItems.find((i) => i.path === location.pathname);
  const currentPageLabel = currentPageItem?.label || 'Overview';

  // Format today date
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0F1117] text-white relative rounded-[22px] overflow-hidden shadow-2xl border border-white/[0.08]">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 ring-1 ring-white/20 shadow-md">
            <SchoolLogo logoUrl={tenant?.logoUrl} size="md" className="w-full h-full object-cover" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-w-0 flex-1"
            >
              <p className="text-[13px] font-bold text-white truncate leading-tight tracking-tight">
                {schoolName}
              </p>
              <p className="text-[10px] font-medium text-indigo-400 flex items-center gap-1 mt-0.5">
                <Building2 className="w-3 h-3 shrink-0" />
                {tenant?.code ? `${tenant.code} Portal` : 'ERP Portal'}
              </p>
            </motion.div>
          )}
        </div>

        {/* Collapse toggle desktop */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex w-7 h-7 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4" style={{ scrollbarWidth: 'none' }}>
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((i) => i.show);
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title}>
              {!collapsed && (
                <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-white/35 px-3 mb-1.5">
                  {group.title}
                </p>
              )}
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      title={collapsed ? item.label : undefined}
                      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group ${
                        isActive
                          ? 'text-white bg-white/[0.12] font-semibold shadow-inner'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                      }`}
                    >
                      {/* Active Indicator Pill */}
                      {isActive && (
                        <motion.div
                          layoutId="activePill"
                          className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-indigo-500 shadow-sm shadow-indigo-500/50"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}

                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                          isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-white'
                        }`}
                      />

                      {!collapsed && (
                        <span className="flex-1 truncate">{item.label}</span>
                      )}

                      {!collapsed && isActive && (
                        <ChevronRight className="w-3.5 h-3.5 text-white/40 shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Chairman badge */}
      {isChairman && !collapsed && (
        <div className="mx-3 mb-2">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
            <Crown className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="text-[11px] font-semibold">2 Approvals Pending</span>
          </div>
        </div>
      )}

      {/* User profile footer card */}
      <div className="p-3 border-t border-white/[0.08]">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white truncate leading-tight">
                {user?.name || 'Guest User'}
              </p>
              <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mt-0.5">
                {user?.role?.replace(/_/g, ' ')}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#F6F8FC] p-3 gap-3">
      {/* ─── Desktop Floating Sidebar ───────────────────────────────────── */}
      <aside
        className={`hidden lg:block shrink-0 h-full transition-all duration-300 ${
          collapsed ? 'w-[68px]' : 'w-[240px]'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* ─── Mobile Drawer Overlay ─────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="relative w-[240px] h-full z-10 p-3"
            >
              <SidebarContent />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Main Workspace Area ────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 h-full rounded-[22px] bg-white border border-slate-200/70 shadow-sm overflow-hidden relative">
        {/* Impersonation Banner */}
        <ImpersonationBanner />

        {/* Modern Top Header Bar */}
        <header className="h-16 shrink-0 px-6 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-md z-20">
          {/* Left section: Hamburger + Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400 font-mono">
                {tenant?.code || 'PORTAL'}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-[14px] font-semibold text-slate-800">
                {currentPageLabel}
              </span>
            </div>
          </div>

          {/* Right section: Search bar, Quick switcher, Date, Bell, Profile */}
          <div className="flex items-center gap-3">
            {/* Global Search Bar Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200/60 text-slate-500 text-xs font-medium transition-all shadow-xs w-48 justify-between cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                Search system...
              </span>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-white rounded border border-slate-200 text-slate-400 font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Current Date Display */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs font-medium text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>{todayFormatted}</span>
            </div>

            {/* Multi-Tenant School Switcher (Super Admin only) */}
            {isSuperAdmin && tenants.length > 0 && (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setSchoolDropOpen(!schoolDropOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-all cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[120px]">{schoolName}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>

                {schoolDropOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-2 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                      Switch Institution
                    </p>
                    {tenants.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          switchTenant(t.id);
                          setSchoolDropOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                          t.id === tenant?.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{t.name}</span>
                        {t.id === tenant?.id && <Sparkles className="w-3 h-3 text-indigo-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notification Bell */}
            <NotificationBell />

            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* Profile Avatar & Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs hover:ring-2 hover:ring-indigo-500/50 transition-all cursor-pointer"
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </button>

              <ProfileMenu isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
            </div>
          </div>
        </header>

        {/* Main Content Workspace View */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#F6F8FC]">
          <Outlet />
        </main>
      </div>

      {/* Global Command Search Palette */}
      <SearchCommand isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};
