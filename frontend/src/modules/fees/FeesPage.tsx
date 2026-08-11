import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  SectionHeader,
  StatCard,
  Table,
  StatusChip,
  Button,
  Card,
  CardHeader,
  Modal,
} from '@/shared/components';
import {
  CreditCard,
  DollarSign,
  Plus,
  Search,
  Building2,
  ChevronDown,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import { feesApi, studentsApi } from '@/services/api/endpoints';
import { Fee, Student } from '@/types/entities';

export const FeesPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { tenants, schoolId: tenantSchoolId } = useTenant();

  const isSuperAdmin = user?.role === 'super_admin';

  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(tenantSchoolId || '');
  const [schoolDropOpen, setSchoolDropOpen] = useState(false);

  const [feeRecords, setFeeRecords] = useState<Fee[]>([]);
  const [summaryData, setSummaryData] = useState<{ totalTarget: number; totalCollected: number; outstandingBalance: number } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  /* Collect Fee Modal */
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [selectedFeeForCollect, setSelectedFeeForCollect] = useState<Fee | null>(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState<number>(0);

  /* Create Fee Modal */
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [createStudentId, setCreateStudentId] = useState('');
  const [createFeeTerm, setCreateFeeTerm] = useState('Term 1 2026');
  const [createTitle, setCreateTitle] = useState('Tuition & Annual Fee');
  const [createAmountDue, setCreateAmountDue] = useState(15000);
  const [createDueDate, setCreateDueDate] = useState('2026-09-30');

  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Fetch Fees */
  const fetchFees = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await feesApi.list({
        school_id: isSuperAdmin ? selectedSchoolId : undefined,
      });

      if (res.data && res.data.summaryOnly) {
        setSummaryData({
          totalTarget: res.data.totalTarget || 0,
          totalCollected: res.data.totalCollected || 0,
          outstandingBalance: res.data.outstandingBalance || 0,
        });
        setFeeRecords([]);
      } else {
        setFeeRecords(res.data || []);
        setSummaryData(null);
      }
    } catch (err: any) {
      console.error('[FeesPage] Failed to fetch fees:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to load fee ledger.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, [selectedSchoolId]);

  const openCreateModal = async () => {
    setIsCreateModalOpen(true);
    try {
      const res = await studentsApi.list(isSuperAdmin ? selectedSchoolId : undefined);
      const sts: Student[] = res.data || [];
      setStudents(sts);
      if (sts.length > 0) setCreateStudentId(sts[0].id);
    } catch {
      toast.error('Failed to load student roster.');
    }
  };

  const handleCreateFeeSubmit = async () => {
    if (!createStudentId || !createFeeTerm.trim() || !createTitle.trim() || createAmountDue <= 0) {
      toast.error('Please complete all required fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      await feesApi.create({
        studentId: createStudentId,
        feeTerm: createFeeTerm.trim(),
        title: createTitle.trim(),
        amountDue: createAmountDue,
        dueDate: createDueDate,
      });
      toast.success('Fee structure created!');
      setIsCreateModalOpen(false);
      fetchFees();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to create fee record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCollectSubmit = async () => {
    if (!selectedFeeForCollect || paymentAmountInput <= 0) {
      toast.error('Please enter a valid payment amount.');
      return;
    }
    setIsSubmitting(true);
    try {
      await feesApi.collect(selectedFeeForCollect.id, { amountPaid: paymentAmountInput });
      toast.success(`Recorded ₹${paymentAmountInput.toLocaleString('en-IN')} payment!`);
      setIsCollectModalOpen(false);
      setSelectedFeeForCollect(null);
      fetchFees();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to collect payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* Metrics Calculation */
  const totalTarget = summaryData
    ? summaryData.totalTarget
    : feeRecords.reduce((acc, f) => acc + f.amountDue, 0);

  const totalCollected = summaryData
    ? summaryData.totalCollected
    : feeRecords.reduce((acc, f) => acc + f.amountPaid, 0);

  const outstandingBalance = summaryData
    ? summaryData.outstandingBalance
    : Math.max(0, totalTarget - totalCollected);

  const filtered = feeRecords.filter(
    (f) =>
      f.studentName.toLowerCase().includes(search.toLowerCase()) ||
      f.className.toLowerCase().includes(search.toLowerCase()) ||
      f.feeTerm.toLowerCase().includes(search.toLowerCase()) ||
      f.title.toLowerCase().includes(search.toLowerCase())
  );

  const selectedSchool = tenants.find((t) => t.id === selectedSchoolId);

  const columns = [
    {
      header: 'Student',
      cell: (f: Fee) => (
        <div>
          <p className="font-semibold text-slate-800 text-[13px]">{f.studentName}</p>
          <p className="text-[11px] text-slate-400 font-mono">Roll: {f.rollNumber}</p>
        </div>
      ),
    },
    {
      header: 'Class',
      cell: (f: Fee) => <span className="font-semibold text-slate-700">Class {f.className}</span>,
    },
    {
      header: 'Fee Term & Title',
      cell: (f: Fee) => (
        <div>
          <p className="font-medium text-slate-800 text-xs">{f.title}</p>
          <p className="text-[11px] text-slate-400">{f.feeTerm}</p>
        </div>
      ),
    },
    {
      header: 'Amount Dues',
      cell: (f: Fee) => (
        <div className="font-mono text-xs">
          <p className="font-bold text-slate-900">₹{f.amountDue.toLocaleString('en-IN')}</p>
          <p className="text-slate-500">Paid: ₹{f.amountPaid.toLocaleString('en-IN')}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (f: Fee) => <StatusChip status={f.paymentStatus === 'paid' ? 'paid' : f.paymentStatus === 'partial' ? 'partial' : 'pending'} />,
    },
    {
      header: 'Actions',
      cell: (f: Fee) => (
        <div>
          {f.paymentStatus !== 'paid' && hasPermission('collect_fees') && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => {
                setSelectedFeeForCollect(f);
                setPaymentAmountInput(f.amountDue - f.amountPaid);
                setIsCollectModalOpen(true);
              }}
            >
              Collect Payment
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Fees & Accounts Desk"
        subtitle="Manage student fee collection, record payments, and track term collection targets."
        breadcrumb={[{ label: 'Finance' }, { label: 'Fees & Accounts' }]}
        action={
          hasPermission('manage_fees') ? (
            <Button
              variant="accent"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={openCreateModal}
            >
              Create Fee Structure
            </Button>
          ) : undefined
        }
      />

      {/* Real Dynamic Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Collection Target" value={`₹${totalTarget.toLocaleString('en-IN')}`} hint="Total fee dues" icon={DollarSign} tone="default" />
        <StatCard label="Total Collected" value={`₹${totalCollected.toLocaleString('en-IN')}`} hint="Realized payments" icon={CreditCard} tone="success" trend="up" />
        <StatCard label="Outstanding Balance" value={`₹${outstandingBalance.toLocaleString('en-IN')}`} hint="Pending accounts" icon={CheckCircle} tone="danger" />
      </div>

      <Card>
        <CardHeader
          title="Student Fee Ledger"
          subtitle={isSuperAdmin && selectedSchool ? `Fee records for ${selectedSchool.name}` : 'Fee payment statuses for current academic session'}
          action={
            <div className="flex items-center gap-2 flex-wrap">
              {isSuperAdmin && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSchoolDropOpen((o) => !o)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-400 rounded-xl text-xs font-semibold text-slate-700 transition-all shadow-xs"
                  >
                    <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="truncate max-w-[140px]">
                      {selectedSchool ? selectedSchool.name : 'Select School'}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${schoolDropOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {schoolDropOpen && (
                    <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 z-30 overflow-hidden p-2 space-y-1">
                      {tenants.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setSelectedSchoolId(t.id);
                            setSchoolDropOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-xs font-medium rounded-xl flex items-center justify-between transition-colors ${
                            selectedSchoolId === t.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="truncate">{t.name}</span>
                          {selectedSchoolId === t.id && <span className="text-indigo-600 font-bold">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {feeRecords.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by student name..."
                    className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
                  />
                </div>
              )}
            </div>
          }
        />

        {error ? (
          <div className="py-12 text-center text-red-500 text-sm font-medium">{error}</div>
        ) : isLoading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading fee ledger...</div>
        ) : summaryData ? (
          <div className="py-12 text-center text-slate-600 text-sm font-medium space-y-1">
            <p className="text-base font-bold text-slate-800">Executive Finance Summary Mode</p>
            <p className="text-xs text-slate-400">Detailed per-student ledger transaction access is reserved for Accounts personnel.</p>
          </div>
        ) : (
          <Table
            data={filtered}
            columns={columns}
            keyExtractor={(f) => f.id}
            selectable
            emptyMessage="No fee records recorded yet."
          />
        )}
      </Card>

      {/* ── Collect Payment Modal ─────────────────────────────────────── */}
      {selectedFeeForCollect && (
        <Modal
          isOpen={isCollectModalOpen}
          onClose={() => setIsCollectModalOpen(false)}
          title="Collect Fee Payment"
          subtitle={`Recording payment for ${selectedFeeForCollect.studentName} (${selectedFeeForCollect.feeTerm})`}
        >
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
              <p className="font-bold text-slate-800">{selectedFeeForCollect.title}</p>
              <p className="text-slate-500">
                Amount Due: <span className="font-bold text-slate-900 font-mono">₹{selectedFeeForCollect.amountDue.toLocaleString('en-IN')}</span>
              </p>
              <p className="text-slate-500">
                Already Paid: <span className="font-bold text-emerald-600 font-mono">₹{selectedFeeForCollect.amountPaid.toLocaleString('en-IN')}</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Payment Amount (₹) *</label>
              <input
                type="number"
                value={paymentAmountInput}
                onChange={(e) => setPaymentAmountInput(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-base font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsCollectModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="accent" size="sm" onClick={handleCollectSubmit} isLoading={isSubmitting}>
                Record Payment
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Create Fee Record Modal ───────────────────────────────────── */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Fee Structure Record"
        subtitle="Assign a fee due to a student account"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Select Student *</label>
            <select
              value={createStudentId}
              onChange={(e) => setCreateStudentId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.fullName} (Roll: {st.rollNumber}, Class {st.className})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Fee Term *</label>
              <input
                value={createFeeTerm}
                onChange={(e) => setCreateFeeTerm(e.target.value)}
                placeholder="e.g. Term 1 2026"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Title *</label>
              <input
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                placeholder="e.g. Tuition Fee"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Amount Due (₹) *</label>
              <input
                type="number"
                value={createAmountDue}
                onChange={(e) => setCreateAmountDue(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Due Date *</label>
              <input
                type="date"
                value={createDueDate}
                onChange={(e) => setCreateDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" size="sm" onClick={handleCreateFeeSubmit} isLoading={isSubmitting}>
              Create Fee Record
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FeesPage;
