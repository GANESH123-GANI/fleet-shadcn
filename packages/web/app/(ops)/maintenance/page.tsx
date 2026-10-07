'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { authFetch } from '@/lib/api/auth-fetch';
import { fetchListStrict } from '@/lib/api/fetch-list';
import { useAuth } from '@/lib/auth/context';
import { ApiErrorBanner } from '@/components/api-error-banner';
import { RecordActions } from '@/components/records/record-actions';
import {
  Wrench,
  History,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Tractor,
  Clock,
  X,
  Package,
} from 'lucide-react';

interface Row extends Record<string, unknown> {
  id?: string;
}

interface PartItem {
  item: string;
  qty: string;
  cost: string;
}

function num(val: unknown): number {
  if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
  if (!val) return 0;
  const parsed = Number(val);
  return Number.isFinite(parsed) ? parsed : 0;
}

function minorToMoney(minor: unknown): string {
  const n = num(minor);
  const major = Math.round(n / 100);
  return `₹${major.toLocaleString('en-IN')}`;
}

export default function MaintenancePage() {
  const { user } = useAuth();
  const isReadOnly = user?.role !== 'owner' && user?.role !== 'admin' && user?.role !== 'ops';

  // Core Data
  const [machines, setMachines] = useState<Row[]>([]);
  const [contributions, setContributions] = useState<Row[]>([]);
  const [allVisits, setAllVisits] = useState<Row[]>([]);
  const [tasks, setTasks] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  // Active Tab: 'overview' | 'ledger'
  const [activeTab, setActiveTab] = useState<'overview' | 'ledger'>('ledger');

  // Filters
  const [selectedMachineFilter, setSelectedMachineFilter] = useState('all');
  const [visitTypeFilter, setVisitTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog / Modal state for adding a visit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMachineId, setFormMachineId] = useState('');
  const [machineTasks, setMachineTasks] = useState<Row[]>([]);
  const [tickedTasks, setTickedTasks] = useState<string[]>([]);
  const [parts, setParts] = useState<PartItem[]>([
    { item: '', qty: '1', cost: '' },
  ]);
  const [form, setForm] = useState({
    visit_date: new Date().toISOString().slice(0, 10),
    visit_type: 'scheduled',
    mechanic: '',
    meter_at_visit: '',
    labour_cost: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Initial Data Fetch
  const loadData = async () => {
    setLoading(true);
    setApiError(false);
    try {
      const [mList, contribList, visitsList, tasksList] = await Promise.all([
        fetchListStrict<Row>('/api/v1/machines'),
        fetchListStrict<Row>('/api/v1/billing/contribution').catch(() => []),
        fetchListStrict<Row>('/api/v1/maintenance/visits').catch(() => []),
        fetchListStrict<Row>('/api/v1/maintenance/tasks').catch(() => []),
      ]);
      setMachines(mList);
      setContributions(contribList);
      setAllVisits(visitsList);
      setTasks(tasksList);
    } catch {
      setApiError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  // When selected machine in form changes, load its tasks
  useEffect(() => {
    if (formMachineId) {
      void fetchListStrict<Row>(`/api/v1/maintenance/machines/${formMachineId}/tasks`)
        .then((data) => setMachineTasks(data))
        .catch(() => setMachineTasks([]));
      setTickedTasks([]);
    } else {
      setMachineTasks([]);
      setTickedTasks([]);
    }
  }, [formMachineId]);

  // Aggregate Fleet Financial Metrics
  const summaryMetrics = useMemo(() => {
    let totalRevenue = 0;
    let totalDiesel = 0;
    let totalParts = 0;
    let totalLabour = 0;

    for (const c of contributions) {
      totalRevenue += num(c.billed_minor);
      totalDiesel += num(c.diesel_minor);
      totalParts += num(c.parts_minor);
      totalLabour += num(c.labour_minor);
    }

    // Also fallback / supplement from visits directly if contribution is 0 or unbilled
    let directVisitDeduction = 0;
    for (const v of allVisits) {
      directVisitDeduction += num(v.labour_cost_txn) + num(v.parts_cost_txn);
    }

    const totalMaintenance = totalParts + totalLabour > 0 ? (totalParts + totalLabour) : directVisitDeduction;
    const netProfit = totalRevenue - (totalMaintenance + totalDiesel);
    const retentionRate = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

    return {
      totalRevenue,
      totalMaintenance,
      totalParts,
      totalLabour,
      totalDiesel,
      netProfit,
      retentionRate,
      visitsCount: allVisits.length,
    };
  }, [contributions, allVisits]);

  // Machine Map for instant lookup
  const machineMap = useMemo(() => {
    const map = new Map<string, Row>();
    for (const m of machines) {
      if (m.id) map.set(String(m.id), m);
    }
    return map;
  }, [machines]);

  // Combined Machine Performance Data (Financials + Maintenance)
  const machineContributions = useMemo(() => {
    return machines.map((m) => {
      const mid = String(m.id);
      const contrib = contributions.find((c) => String(c.machine_id) === mid);
      
      // Compute machine visits deductions
      const machineVisits = allVisits.filter((v) => String(v.machine_id) === mid);
      const visitPartsTotal = machineVisits.reduce((acc, v) => acc + num(v.parts_cost_txn), 0);
      const visitLabourTotal = machineVisits.reduce((acc, v) => acc + num(v.labour_cost_txn), 0);

      const billed = num(contrib?.billed_minor);
      const partsCost = contrib?.parts_minor ? num(contrib.parts_minor) : visitPartsTotal;
      const labourCost = contrib?.labour_minor ? num(contrib.labour_minor) : visitLabourTotal;
      const maintenanceTotal = partsCost + labourCost;
      const diesel = num(contrib?.diesel_minor);
      const netProfit = billed - (maintenanceTotal + diesel);
      const marginPct = billed > 0 ? Math.round((netProfit / billed) * 100) : 0;

      return {
        id: mid,
        code: String(m.code ?? '—'),
        model: String(m.model ?? '—'),
        type: String(m.type ?? '—'),
        status: String(m.status_flag ?? 'active'),
        currentMeter: num(m.current_meter),
        meterType: String(m.primary_meter_type ?? 'hours'),
        billed,
        partsCost,
        labourCost,
        maintenanceTotal,
        diesel,
        netProfit,
        marginPct,
        visitsCount: machineVisits.length,
      };
    });
  }, [machines, contributions, allVisits]);

  // Filtered Visits History List
  const filteredVisits = useMemo(() => {
    return allVisits.filter((v) => {
      const mid = String(v.machine_id);
      if (selectedMachineFilter !== 'all' && mid !== selectedMachineFilter) {
        return false;
      }

      const vType = String(v.visit_type ?? '').toLowerCase();
      if (visitTypeFilter !== 'all' && vType !== visitTypeFilter.toLowerCase()) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const m = machineMap.get(mid);
        const mCode = String(m?.code ?? v.machine_code ?? '').toLowerCase();
        const mModel = String(m?.model ?? v.machine_model ?? '').toLowerCase();
        const mechanic = String(v.mechanic ?? '').toLowerCase();
        const notes = String(v.notes ?? '').toLowerCase();
        
        let partsMatch = false;
        if (Array.isArray(v.parts)) {
          partsMatch = (v.parts as Record<string, unknown>[]).some((p) =>
            String(p.item ?? '').toLowerCase().includes(query)
          );
        }

        if (!mCode.includes(query) && !mModel.includes(query) && !mechanic.includes(query) && !notes.includes(query) && !partsMatch) {
          return false;
        }
      }

      return true;
    });
  }, [allVisits, selectedMachineFilter, visitTypeFilter, searchQuery, machineMap]);

  // Real-time calculation of parts & labour in the creation form
  const formCalculatedCosts = useMemo(() => {
    const labourMajor = parseFloat(form.labour_cost || '0') || 0;
    let partsMajor = 0;
    for (const p of parts) {
      if (p.item.trim()) {
        const qty = parseFloat(p.qty || '1') || 1;
        const unitCost = parseFloat(p.cost || '0') || 0;
        partsMajor += qty * unitCost;
      }
    }
    const totalMajor = labourMajor + partsMajor;
    return {
      labourMajor,
      partsMajor,
      totalMajor,
      totalMinor: Math.round(totalMajor * 100),
      labourMinor: Math.round(labourMajor * 100),
    };
  }, [form.labour_cost, parts]);

  // Submit New Maintenance Visit
  const handleSaveVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMachineId) {
      setFormError('Please select a machine.');
      return;
    }
    setFormError('');
    setSaving(true);

    try {
      const validParts = parts
        .filter((p) => p.item.trim().length > 0)
        .map((p) => ({
          item: p.item.trim(),
          qty: parseFloat(p.qty || '1') || 1,
          unit_cost_txn: Math.round((parseFloat(p.cost || '0') || 0) * 100),
          currency: 'INR',
          is_consumable: true,
        }));

      const payload = {
        machine_id: formMachineId,
        visit_date: form.visit_date,
        visit_type: form.visit_type,
        mechanic: form.mechanic.trim() || undefined,
        meter_at_visit: form.meter_at_visit ? parseFloat(form.meter_at_visit) : undefined,
        labour_cost_txn: formCalculatedCosts.labourMinor,
        labour_currency: 'INR',
        labour_base: formCalculatedCosts.labourMinor,
        notes: form.notes.trim() || undefined,
        task_ids: tickedTasks,
        parts: validParts,
        client_uuid: crypto.randomUUID(),
      };

      const res = await authFetch('/api/v1/maintenance/visits', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || 'Failed to save maintenance visit.');
      }

      // Reset form & reload
      setForm({
        visit_date: new Date().toISOString().slice(0, 10),
        visit_type: 'scheduled',
        mechanic: '',
        meter_at_visit: '',
        labour_cost: '',
        notes: '',
      });
      setParts([{ item: '', qty: '1', cost: '' }]);
      setTickedTasks([]);
      setIsFormOpen(false);
      await loadData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error saving visit.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {apiError && <ApiErrorBanner />}

      {/* Top Header & Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-solid border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-black dark:text-white shadow-none">
              <Wrench className="h-5 w-5 text-black dark:text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Maintenance
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Machine revenue, maintenance deductions, spare parts, labour costs & service ledger.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadData()}
            disabled={loading}
            className="border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {!isReadOnly && (
            <Button
              size="sm"
              onClick={() => setIsFormOpen(true)}
              className="bg-black hover:bg-slate-800 text-white dark:bg-white dark:text-black dark:hover:bg-slate-200"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Log Maintenance
            </Button>
          )}
        </div>
      </div>

      {/* Unified 4-Column KPI Strip (Bordered Container with Dividers) */}
      <div className="rounded-2xl border border-solid border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-none overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-300 dark:divide-slate-700">
          {/* 1. Total Fleet Revenue */}
          <div className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Fleet Revenue
              </span>
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-2 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {minorToMoney(summaryMetrics.totalRevenue)}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Gross billing from active deployments
              </p>
            </div>
          </div>

          {/* 2. Total Maintenance Deductions */}
          <div className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Maintenance Deductions
              </span>
              <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 p-2 text-rose-600 dark:text-rose-400">
                <ArrowDownRight className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                -{minorToMoney(summaryMetrics.totalMaintenance)}
              </p>
              <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Parts: {minorToMoney(summaryMetrics.totalParts)}</span>
                <span>Labour: {minorToMoney(summaryMetrics.totalLabour)}</span>
              </div>
            </div>
          </div>

          {/* 3. Net Operating Contribution */}
          <div className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Net Operating Margin
              </span>
              <div className="rounded-lg bg-sky-50 dark:bg-sky-950/40 p-2 text-sky-600 dark:text-sky-400">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {minorToMoney(summaryMetrics.netProfit)}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {summaryMetrics.retentionRate}%
                </span>
                <span>margin retained after maintenance & fuel</span>
              </div>
            </div>
          </div>

          {/* 4. Fleet Service Activity */}
          <div className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Service Events Logged
              </span>
              <div className="rounded-lg bg-violet-50 dark:bg-violet-950/40 p-2 text-violet-600 dark:text-violet-400">
                <History className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {summaryMetrics.visitsCount} <span className="text-sm font-normal text-slate-500">visits</span>
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Across {machines.length} fleet machines · {tasks.length} active tasks
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center justify-between border-b border-solid border-slate-300 dark:border-slate-700 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === 'ledger'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-black'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Maintenance Deductions Ledger ({allVisits.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-black'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Machine Revenue vs. Deductions ({machines.length})</span>
          </button>
        </div>

        <span className="hidden sm:inline-block text-xs text-slate-500">
          Showing {activeTab === 'ledger' ? filteredVisits.length : machineContributions.length} records
        </span>
      </div>

      {/* TAB 1: MAINTENANCE DEDUCTION HISTORY & LEDGER (Main user request) */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          {/* Filter & Search Ribbon */}
          <div className="rounded-2xl border border-solid border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-none">
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {/* Machine Filter Dropdown */}
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Filter by Machine
                </label>
                <select
                  value={selectedMachineFilter}
                  onChange={(e) => setSelectedMachineFilter(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="all">All Machines (Entire Fleet)</option>
                  {machines.map((m) => (
                    <option key={String(m.id)} value={String(m.id)}>
                      {String(m.code)} {m.model ? `· ${String(m.model)}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Visit Type Filter */}
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Service Category
                </label>
                <select
                  value={visitTypeFilter}
                  onChange={(e) => setVisitTypeFilter(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="all">All Service Types</option>
                  <option value="scheduled">Scheduled Service</option>
                  <option value="breakdown">Breakdown Repair</option>
                  <option value="inspection">Inspection</option>
                </select>
              </div>

              {/* Search Bar */}
              <div className="sm:col-span-1 lg:col-span-2">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Search History
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search mechanic, part replacement, reason, machine..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 text-sm border-slate-300 dark:border-slate-700"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-2xl border border-solid border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-none overflow-hidden">
            <div className="px-5 py-4 border-b border-solid border-slate-300 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Itemized Maintenance Deductions History
                </h3>
                <p className="text-xs text-slate-500">
                  Every service event with exact parts used, labour cost, and total amount deducted from machine earnings.
                </p>
              </div>
              <Badge variant="outline" className="border-slate-300 text-xs">
                {filteredVisits.length} Records
              </Badge>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-slate-400" />
                <p className="text-sm">Loading maintenance deduction ledger…</p>
              </div>
            ) : filteredVisits.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Wrench className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
                  No maintenance deductions found
                </p>
                <p className="text-xs mt-1 text-slate-400">
                  {searchQuery || selectedMachineFilter !== 'all' || visitTypeFilter !== 'all'
                    ? 'Try adjusting your filters or search keywords.'
                    : 'Click "Log Maintenance" to record the first service visit.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 border-b border-solid border-slate-300 dark:border-slate-700">
                    <tr>
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-5 py-3.5">Machine</th>
                      <th className="px-5 py-3.5">Service Type & Reason</th>
                      <th className="px-5 py-3.5">Mechanic</th>
                      <th className="px-5 py-3.5">Parts Replaced</th>
                      <th className="px-5 py-3.5 text-right">Parts Cost</th>
                      <th className="px-5 py-3.5 text-right">Labour Cost</th>
                      <th className="px-5 py-3.5 text-right">Total Deducted</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredVisits.map((v) => {
                      const mid = String(v.machine_id);
                      const m = machineMap.get(mid);
                      const mCode = String(m?.code ?? v.machine_code ?? 'Machine');
                      const mModel = String(m?.model ?? v.machine_model ?? '');
                      const dateStr = String(v.visit_date ?? '').slice(0, 10);
                      const vType = String(v.visit_type ?? 'scheduled');
                      const mechanic = String(v.mechanic ?? '—');
                      const partsList = Array.isArray(v.parts) ? (v.parts as Record<string, unknown>[]) : [];
                      
                      const labourMinor = num(v.labour_cost_txn || v.labour_base);
                      const partsMinor = num(v.parts_cost_txn);
                      const totalDeductedMinor = labourMinor + partsMinor;

                      return (
                        <tr
                          key={String(v.id)}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {/* Date */}
                          <td className="px-5 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-white">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              <span>{dateStr || '—'}</span>
                            </div>
                            {Boolean(v.meter_at_visit) && (
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                at {num(v.meter_at_visit).toLocaleString()} {String(m?.primary_meter_type ?? 'hrs')}
                              </p>
                            )}
                          </td>

                          {/* Machine */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">
                                {mCode.slice(0, 3)}
                              </span>
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {mCode}
                                </span>
                                {Boolean(mModel) && (
                                  <p className="text-xs text-slate-500">{mModel}</p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Service Type & Reason */}
                          <td className="px-5 py-4">
                            <div className="space-y-1 max-w-xs">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  vType === 'breakdown'
                                    ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-800'
                                    : vType === 'inspection'
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                }`}
                              >
                                {vType.toUpperCase()}
                              </span>
                              {Boolean(v.notes) && (
                                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                                  {String(v.notes)}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Mechanic */}
                          <td className="px-5 py-4 whitespace-nowrap text-slate-700 dark:text-slate-300">
                            {mechanic}
                          </td>

                          {/* Parts Replaced (Itemized List) */}
                          <td className="px-5 py-4">
                            {partsList.length === 0 ? (
                              <span className="text-xs text-slate-400 italic">None logged</span>
                            ) : (
                              <div className="space-y-1 max-w-sm">
                                {partsList.map((p, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between text-xs rounded bg-slate-100 dark:bg-slate-800 px-2 py-1"
                                  >
                                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                                      {String(p.item)} <span className="text-slate-500">×{String(p.qty)}</span>
                                    </span>
                                    <span className="ml-2 font-semibold text-slate-600 dark:text-slate-400 shrink-0">
                                      {minorToMoney(num(p.unit_cost_txn) * num(p.qty))}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>

                          {/* Parts Cost */}
                          <td className="px-5 py-4 text-right whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                            {minorToMoney(partsMinor)}
                          </td>

                          {/* Labour Cost */}
                          <td className="px-5 py-4 text-right whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                            {minorToMoney(labourMinor)}
                          </td>

                          {/* Total Deducted Amount */}
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                              -{minorToMoney(totalDeductedMinor)}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <RecordActions
                              table="maintenance_visits"
                              row={v}
                              onChanged={() => void loadData()}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MACHINE REVENUE VS MAINTENANCE DEDUCTIONS (P&L Matrix) */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-solid border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-none overflow-hidden">
            <div className="px-5 py-4 border-b border-solid border-slate-300 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Machine Financial Contribution & Maintenance Deductions
                </h3>
                <p className="text-xs text-slate-500">
                  Breakdown of total revenue generated by each machine, less spare parts, labour, and diesel.
                </p>
              </div>
              <Badge variant="outline" className="border-slate-300 text-xs">
                {machineContributions.length} Fleet Units
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 border-b border-solid border-slate-300 dark:border-slate-700">
                  <tr>
                    <th className="px-5 py-3.5">Machine</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Revenue Generated</th>
                    <th className="px-5 py-3.5 text-right">Parts Deducted</th>
                    <th className="px-5 py-3.5 text-right">Labour Deducted</th>
                    <th className="px-5 py-3.5 text-right">Total Maintenance</th>
                    <th className="px-5 py-3.5 text-right">Diesel Cost</th>
                    <th className="px-5 py-3.5 text-right">Net Profit</th>
                    <th className="px-5 py-3.5 text-center">Retention Bar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {machineContributions.map((mc) => {
                    const isProfitable = mc.netProfit >= 0;
                    return (
                      <tr
                        key={mc.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Machine */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs">
                              {mc.code.slice(0, 3)}
                            </span>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">
                                {mc.code}
                              </p>
                              <p className="text-xs text-slate-500">
                                {mc.model} · {mc.type}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              mc.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {mc.status.toUpperCase()}
                          </span>
                        </td>

                        {/* Revenue Generated */}
                        <td className="px-5 py-4 text-right whitespace-nowrap font-bold text-slate-900 dark:text-white">
                          {minorToMoney(mc.billed)}
                        </td>

                        {/* Parts Deducted */}
                        <td className="px-5 py-4 text-right whitespace-nowrap text-slate-600 dark:text-slate-400">
                          {minorToMoney(mc.partsCost)}
                        </td>

                        {/* Labour Deducted */}
                        <td className="px-5 py-4 text-right whitespace-nowrap text-slate-600 dark:text-slate-400">
                          {minorToMoney(mc.labourCost)}
                        </td>

                        {/* Total Maintenance Deducted */}
                        <td className="px-5 py-4 text-right whitespace-nowrap font-semibold text-rose-600 dark:text-rose-400">
                          -{minorToMoney(mc.maintenanceTotal)}
                        </td>

                        {/* Diesel Cost */}
                        <td className="px-5 py-4 text-right whitespace-nowrap text-slate-600 dark:text-slate-400">
                          {minorToMoney(mc.diesel)}
                        </td>

                        {/* Net Profit */}
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <span
                            className={`font-extrabold text-sm ${
                              isProfitable
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {minorToMoney(mc.netProfit)}
                          </span>
                          <p className="text-[11px] text-slate-500">
                            {mc.marginPct}% margin
                          </p>
                        </td>

                        {/* Retention Bar */}
                        <td className="px-5 py-4 w-36 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  mc.marginPct >= 70
                                    ? 'bg-emerald-500'
                                    : mc.marginPct >= 40
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{
                                  width: `${Math.max(0, Math.min(100, mc.marginPct))}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                              {mc.marginPct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* LOG MAINTENANCE VISIT MODAL / DRAWER */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-solid border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl p-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-solid border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl border border-solid border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-black dark:text-white">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Log Maintenance Visit & Deductions
                  </h2>
                  <p className="text-xs text-slate-500">
                    Record service details, mechanic labour, and spare parts to deduct from machine revenue.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs font-medium">
                {formError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={(e) => void handleSaveVisit(e)} className="mt-5 space-y-4">
              {/* Machine Selection & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Machine *
                  </label>
                  <select
                    value={formMachineId}
                    onChange={(e) => setFormMachineId(e.target.value)}
                    required
                    className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    <option value="">Select machine…</option>
                    {machines.map((m) => (
                      <option key={String(m.id)} value={String(m.id)}>
                        {String(m.code)} {m.model ? `· ${String(m.model)}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Service Date *
                  </label>
                  <Input
                    type="date"
                    value={form.visit_date}
                    onChange={(e) => setForm({ ...form, visit_date: e.target.value })}
                    required
                    className="border-slate-300 dark:border-slate-700 text-sm"
                  />
                </div>
              </div>

              {/* Service Type & Mechanic */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Service Type *
                  </label>
                  <select
                    value={form.visit_type}
                    onChange={(e) => setForm({ ...form, visit_type: e.target.value })}
                    className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    <option value="scheduled">Scheduled Service</option>
                    <option value="breakdown">Breakdown Repair</option>
                    <option value="inspection">Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mechanic / Technician
                  </label>
                  <Input
                    placeholder="e.g. Ramesh Workshop"
                    value={form.mechanic}
                    onChange={(e) => setForm({ ...form, mechanic: e.target.value })}
                    className="border-slate-300 dark:border-slate-700 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Meter Reading at Visit
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 1250"
                    value={form.meter_at_visit}
                    onChange={(e) => setForm({ ...form, meter_at_visit: e.target.value })}
                    className="border-slate-300 dark:border-slate-700 text-sm"
                  />
                </div>
              </div>

              {/* Labour Cost & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Labour Cost (₹ major)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 text-sm">₹</span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={form.labour_cost}
                      onChange={(e) => setForm({ ...form, labour_cost: e.target.value })}
                      className="pl-7 border-slate-300 dark:border-slate-700 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Maintenance Reason / Notes
                  </label>
                  <Input
                    placeholder="Description of work done..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="border-slate-300 dark:border-slate-700 text-sm"
                  />
                </div>
              </div>

              {/* Tasks Checklist if any exist for this machine */}
              {machineTasks.length > 0 && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-800/40">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    Preventive Tasks Completed (Ticking advances next-due interval)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {machineTasks.map((t) => (
                      <label
                        key={String(t.id)}
                        className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs cursor-pointer hover:border-slate-400"
                      >
                        <input
                          type="checkbox"
                          checked={tickedTasks.includes(String(t.id))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTickedTasks([...tickedTasks, String(t.id)]);
                            } else {
                              setTickedTasks(tickedTasks.filter((x) => x !== String(t.id)));
                            }
                          }}
                          className="rounded text-slate-900 h-4 w-4"
                        />
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {String(t.name)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Spare Parts Replaced (Itemized) */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      Spare Parts & Consumables Replaced
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Itemized breakdown deducted from machine gross revenue.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setParts([...parts, { item: '', qty: '1', cost: '' }])}
                    className="text-xs h-7 border-slate-300 dark:border-slate-700"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Part
                  </Button>
                </div>

                <div className="space-y-2">
                  {parts.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        placeholder="Part name (e.g. Engine Oil 15W-40)"
                        value={p.item}
                        onChange={(e) =>
                          setParts(
                            parts.map((item, i) =>
                              i === idx ? { ...item, item: e.target.value } : item
                            )
                          )
                        }
                        className="flex-1 text-xs border-slate-300 dark:border-slate-700"
                      />
                      <Input
                        placeholder="Qty"
                        type="number"
                        step="0.1"
                        value={p.qty}
                        onChange={(e) =>
                          setParts(
                            parts.map((item, i) =>
                              i === idx ? { ...item, qty: e.target.value } : item
                            )
                          )
                        }
                        className="w-16 text-xs border-slate-300 dark:border-slate-700"
                      />
                      <div className="relative w-28">
                        <span className="absolute left-2.5 top-2 text-slate-400 text-xs">₹</span>
                        <Input
                          placeholder="Cost"
                          type="number"
                          step="0.01"
                          value={p.cost}
                          onChange={(e) =>
                            setParts(
                              parts.map((item, i) =>
                                i === idx ? { ...item, cost: e.target.value } : item
                              )
                            )
                          }
                          className="pl-6 text-xs border-slate-300 dark:border-slate-700"
                        />
                      </div>
                      {parts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setParts(parts.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Deduction Calculation Summary */}
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 p-4">
                <div className="flex items-center justify-between text-xs text-rose-800 dark:text-rose-300 mb-1">
                  <span>Labour: ₹{formCalculatedCosts.labourMajor.toLocaleString('en-IN')}</span>
                  <span>Parts: ₹{formCalculatedCosts.partsMajor.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between border-t border-rose-200 dark:border-rose-900/60 pt-2 font-bold text-sm text-rose-900 dark:text-rose-200">
                  <span>Total Amount Deducted from Machine Revenue:</span>
                  <span className="text-base text-rose-600 dark:text-rose-400">
                    -₹{formCalculatedCosts.totalMajor.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-solid border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving || !formMachineId}
                  className="bg-black hover:bg-slate-800 text-white dark:bg-white dark:text-black dark:hover:bg-slate-200"
                >
                  {saving ? 'Saving Visit…' : 'Save & Record Deduction'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
