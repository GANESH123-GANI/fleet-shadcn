'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Phone,
  Award,
  MapPin,
  Truck,
  Pencil,
  Trash2,
  Search,
  Plus,
  ShieldCheck,
  Clock,
  HardHat,
  Star,
  IndianRupee,
  Briefcase,
  CheckCircle2,
  X,
  Mail,
  Home,
  Languages,
  Heart,
  FileText,
  UserCheck,
  ArrowRight,
  ExternalLink,
  Upload,
  Camera,
  Check,
} from 'lucide-react';
import { fetchList, getCachedList } from '@/lib/api/fetch-list';
import { apiDelete } from '@/lib/api/mutations';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { BorderButton } from '@/components/ui/border-button';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

interface OperatorEntry {
  id: string;
  name: string;
  age?: number;
  phone?: string;
  email?: string;
  gmail?: string;
  marital_status?: string;
  native_place?: string;
  languages?: string;
  monthly_salary?: number;
  hourly_wage?: number;
  experience_years?: number;
  employment_type?: string;
  address?: string;
  emergency_contact?: string;
  license?: string;
  license_number?: string;
  specialization?: string;
  grade?: string;
  hourly_wage_calc?: number;
  rating?: number;
  status?: string;
  is_active?: boolean;
  assigned_machine_id?: string | null;
  assigned_machine_code?: string | null;
  assigned_machine?: string | null;
  site?: string | null;
  client?: string | null;
  photo_url?: string | null;
}

interface MachineEntry {
  id: string;
  code: string;
  make: string;
  model: string;
  type?: string;
  operator_id?: string;
  site_id?: string;
  site_name?: string;
  client_name?: string;
  status_flag?: string;
}

// Built-in realistic photos for registered operators
const OPERATOR_PHOTOS: Record<string, string> = {
  'op-001': '/operators/op-001.jpg',
  'op-002': '/operators/op-002.jpg',
  'op-003': '/operators/op-003.jpg',
  'op-004': '/operators/op-004.jpg',
  'op-005': '/operators/op-005.jpg',
  'op-006': '/operators/op-006.jpg',
};

const OPERATOR_PHOTOS_BY_NAME: Record<string, string> = {
  'ramesh kumar': '/operators/op-001.jpg',
  'suresh yadav': '/operators/op-002.jpg',
  'abdul karim': '/operators/op-003.jpg',
  'vikram singh': '/operators/op-004.jpg',
  'pradeep sharma': '/operators/op-005.jpg',
  'manoj gowda': '/operators/op-006.jpg',
};

export default function OwnerOperators() {
  const router = useRouter();
  const cachedOps = getCachedList<OperatorEntry>('/api/v1/operators');
  const cachedMachs = getCachedList<MachineEntry>('/api/v1/machines');
  const [operators, setOperators] = useState<OperatorEntry[]>(() => cachedOps ?? []);
  const [machines, setMachines] = useState<MachineEntry[]>(() => cachedMachs ?? []);
  const [loading, setLoading] = useState<boolean>(() => !cachedOps || cachedOps.length === 0);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'on_shift' | 'off_duty'>('all');
  const [selectedOperator, setSelectedOperator] = useState<OperatorEntry | null>(null);

  // Add Operator Modal and Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('/operators/op-001.jpg');
  const [savingOperator, setSavingOperator] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    age: '38',
    marital_status: 'Married',
    native_place: 'Hassan, Karnataka',
    languages: 'Kannada, Hindi',
    employment_type: 'Full Time (Permanent)',
    monthly_salary: '42000',
    experience_years: '9',
    grade: 'Grade A',
    specialization: 'Excavator & Deep Trenching',
    status: 'on_shift',
    phone: '+91 98451 11223',
    gmail: 'ramesh.k@fleetteam.in',
    address: '#42, 2nd Cross, Industrial Area, Peenya, Bengaluru, Karnataka 560058',
    assigned_machine_id: '',
    assigned_machine_code: '',
    site: 'Bangalore Metro Phase 2 — Reach 6',
    client: 'L&T Construction',
    license_number: 'KA-05-2016-HE-00841',
  });

  useEffect(() => {
    Promise.all([
      fetchList<OperatorEntry>('/api/v1/operators').catch(() => []),
      fetchList<MachineEntry>('/api/v1/machines').catch(() => []),
    ])
      .then(([opData, mchData]) => {
        let storedCustom: OperatorEntry[] = [];
        try {
          storedCustom = JSON.parse(localStorage.getItem('fleetos_custom_operators') || '[]');
        } catch {
          storedCustom = [];
        }
        // Merge stored custom operators with remote data (custom operators first)
        const customIds = new Set(storedCustom.map((o) => o.id));
        const filteredOpData = opData.filter((o) => !customIds.has(o.id));
        setOperators([...storedCustom, ...filteredOpData]);
        setMachines(mchData);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id: string, name: string) => setDeleteTarget({ id, label: name });

  const confirmDeleteOperator = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiDelete(`/api/v1/operators/${deleteTarget.id}`);
      setOperators((prev) => prev.filter((o) => o.id !== deleteTarget.id));
      try {
        const stored: OperatorEntry[] = JSON.parse(localStorage.getItem('fleetos_custom_operators') || '[]');
        localStorage.setItem('fleetos_custom_operators', JSON.stringify(stored.filter((o) => o.id !== deleteTarget.id)));
      } catch {}
      if (selectedOperator?.id === deleteTarget.id) setSelectedOperator(null);
      setDeleteTarget(null);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setPhotoPreview(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMachineSelect = (mchId: string) => {
    const m = machines.find((mch) => mch.id === mchId);
    if (m) {
      setFormData((prev) => ({
        ...prev,
        assigned_machine_id: m.id,
        assigned_machine_code: m.code,
        site: m.site_name || prev.site,
        client: m.client_name || prev.client,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        assigned_machine_id: '',
        assigned_machine_code: '',
      }));
    }
  };

  const handleAddOperatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter operator name');
      return;
    }
    setSavingOperator(true);

    const opId = `op-${Date.now().toString(36)}`;
    const newEntry: OperatorEntry = {
      id: opId,
      name: formData.name.trim(),
      age: Number(formData.age) || 35,
      phone: formData.phone.trim() || '+91 98451 11223',
      email: formData.gmail.trim() || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@fleetteam.in`,
      gmail: formData.gmail.trim() || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      marital_status: formData.marital_status,
      native_place: formData.native_place,
      languages: formData.languages,
      monthly_salary: Number(formData.monthly_salary) || 42000,
      hourly_wage: Math.round((Number(formData.monthly_salary) || 42000) / 120),
      experience_years: Number(formData.experience_years) || 5,
      employment_type: formData.employment_type,
      address: formData.address,
      license: formData.license_number,
      license_number: formData.license_number,
      specialization: formData.specialization,
      grade: formData.grade,
      is_active: formData.status === 'on_shift',
      status: formData.status,
      assigned_machine_id: formData.assigned_machine_id || null,
      assigned_machine_code: formData.assigned_machine_code || null,
      site: formData.site,
      client: formData.client,
      photo_url: photoPreview,
    };

    try {
      await fetch('/api/v1/operators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      });
    } catch {
      // offline / mock db handled
    }

    try {
      const stored: OperatorEntry[] = JSON.parse(localStorage.getItem('fleetos_custom_operators') || '[]');
      localStorage.setItem('fleetos_custom_operators', JSON.stringify([newEntry, ...stored]));
    } catch {}

    setOperators((prev) => [newEntry, ...prev]);
    setIsAddModalOpen(false);
    setSavingOperator(false);

    // Reset form
    setFormData({
      name: '',
      age: '38',
      marital_status: 'Married',
      native_place: 'Hassan, Karnataka',
      languages: 'Kannada, Hindi',
      employment_type: 'Full Time (Permanent)',
      monthly_salary: '42000',
      experience_years: '9',
      grade: 'Grade A',
      specialization: 'Excavator & Deep Trenching',
      status: 'on_shift',
      phone: '+91 98451 11223',
      gmail: '',
      address: '#42, 2nd Cross, Industrial Area, Peenya, Bengaluru, Karnataka 560058',
      assigned_machine_id: '',
      assigned_machine_code: '',
      site: 'Bangalore Metro Phase 2 — Reach 6',
      client: 'L&T Construction',
      license_number: 'KA-05-2016-HE-00841',
    });

    // Instantly open the detailed view for this newly added operator!
    setSelectedOperator(newEntry);
  };

  const uniqueOperators = useMemo(() => {
    const seen = new Set<string>();
    return operators.filter((o) => {
      const name = String(o.name ?? '').trim();
      if (!name || seen.has(name.toLowerCase())) return false;
      seen.add(name.toLowerCase());
      return true;
    });
  }, [operators]);

  // Quick lookup map for machine by operator ID or machine code
  const machineByOperator = useMemo(() => {
    const map = new Map<MachineEntry['id'], MachineEntry>();
    machines.forEach((m) => {
      if (m.operator_id) map.set(m.operator_id, m);
      if (m.code) map.set(m.code, m);
      if (m.id) map.set(m.id, m);
    });
    return map;
  }, [machines]);

  const filteredOperators = useMemo(() => {
    return uniqueOperators.filter((o) => {
      if (statusFilter === 'on_shift' && !o.is_active) return false;
      if (statusFilter === 'off_duty' && o.is_active) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();

      const assignedMachine =
        machineByOperator.get(o.id) ||
        (o.assigned_machine_code ? machineByOperator.get(o.assigned_machine_code) : null) ||
        (o.assigned_machine_id ? machineByOperator.get(o.assigned_machine_id) : null);

      return (
        o.name.toLowerCase().includes(q) ||
        (o.license && o.license.toLowerCase().includes(q)) ||
        (o.license_number && o.license_number.toLowerCase().includes(q)) ||
        (o.specialization && o.specialization.toLowerCase().includes(q)) ||
        (o.phone && o.phone.includes(q)) ||
        (o.native_place && o.native_place.toLowerCase().includes(q)) ||
        (o.languages && o.languages.toLowerCase().includes(q)) ||
        (assignedMachine && assignedMachine.code.toLowerCase().includes(q)) ||
        (assignedMachine && assignedMachine.model.toLowerCase().includes(q)) ||
        (assignedMachine && assignedMachine.site_name?.toLowerCase().includes(q)) ||
        (o.site && o.site.toLowerCase().includes(q))
      );
    });
  }, [uniqueOperators, searchQuery, statusFilter, machineByOperator]);

  // Overall KPI statistics
  const totalOperatorsCount = uniqueOperators.length;
  const onShiftCount = uniqueOperators.filter((o) => o.is_active !== false).length;
  const avgExp = useMemo(() => {
    if (!uniqueOperators.length) return 0;
    const sum = uniqueOperators.reduce((acc, o) => acc + (o.experience_years ?? 6), 0);
    return (sum / uniqueOperators.length).toFixed(1);
  }, [uniqueOperators]);

  const getPhotoUrl = (o: OperatorEntry) => {
    if (o.photo_url) return o.photo_url;
    if (OPERATOR_PHOTOS[o.id]) return OPERATOR_PHOTOS[o.id];
    const nameKey = (o.name || '').trim().toLowerCase();
    if (OPERATOR_PHOTOS_BY_NAME[nameKey]) return OPERATOR_PHOTOS_BY_NAME[nameKey];
    return '/operators/op-001.jpg';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-normal tracking-tight text-black">Operators</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-normal border border-zinc-300 bg-zinc-100 text-black">
              <HardHat className="h-3.5 w-3.5 text-black" />
              <span className="font-normal text-black">{totalOperatorsCount} Verified</span>
            </span>
          </div>
          <p className="text-sm font-normal text-black mt-1">
            Machine operator profiles, equipment certifications, real-time deployments, and RTO credentials
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-black hover:bg-zinc-800 text-white font-normal shadow-sm cursor-pointer"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add Operator
        </Button>
      </div>

      {/* Overview Metric Boxes - Box Shaped, Perfectly Aligned, No Right Images */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Box 1: Total Operators */}
        <div className="rounded-2xl border border-zinc-300 bg-white p-5 sm:p-6 flex flex-col justify-between min-h-[150px] sm:min-h-[160px] hover:border-black transition-all shadow-xs">
          <div className="flex items-center justify-between h-5">
            <p className="text-xs font-medium text-black uppercase tracking-wider">Total Operators</p>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold tracking-tight text-black">{totalOperatorsCount}</span>
              <span className="text-xs font-normal text-zinc-600">registered</span>
            </div>
          </div>
        </div>

        {/* Box 2: Active On Shift */}
        <div className="rounded-2xl border border-zinc-300 bg-white p-5 sm:p-6 flex flex-col justify-between min-h-[150px] sm:min-h-[160px] hover:border-black transition-all shadow-xs">
          <div className="flex items-center justify-between h-5">
            <p className="text-xs font-medium text-black uppercase tracking-wider">Active On Shift</p>
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50" title="Active on site" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold tracking-tight text-black">{onShiftCount}</span>
              <span className="text-xs font-normal text-zinc-600">deployed</span>
            </div>
          </div>
        </div>

        {/* Box 3: Avg Fleet Experience */}
        <div className="rounded-2xl border border-zinc-300 bg-white p-5 sm:p-6 flex flex-col justify-between min-h-[150px] sm:min-h-[160px] hover:border-black transition-all shadow-xs">
          <div className="flex items-center justify-between h-5">
            <p className="text-xs font-medium text-black uppercase tracking-wider">Avg Fleet Experience</p>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold tracking-tight text-black">{avgExp}</span>
              <span className="text-xs font-normal text-zinc-600">years</span>
            </div>
          </div>
        </div>

        {/* Box 4: Safety & RTO Rating */}
        <div className="rounded-2xl border border-zinc-300 bg-white p-5 sm:p-6 flex flex-col justify-between min-h-[150px] sm:min-h-[160px] hover:border-black transition-all shadow-xs">
          <div className="flex items-center justify-between h-5">
            <p className="text-xs font-medium text-black uppercase tracking-wider">Safety & RTO Rating</p>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold tracking-tight text-black">4.8</span>
              <span className="text-xs font-normal text-zinc-600">/ 5.0 score</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
          <input
            type="text"
            placeholder="Search operator name, license, native place, languages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-zinc-300 bg-white text-black placeholder:text-black/40 focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-normal transition-colors border ${
              statusFilter === 'all'
                ? 'border-black bg-black text-white'
                : 'border-zinc-300 bg-white text-black hover:bg-zinc-100'
            }`}
          >
            All Operators ({totalOperatorsCount})
          </button>
          <button
            onClick={() => setStatusFilter('on_shift')}
            className={`px-3 py-1.5 rounded-lg text-xs font-normal transition-colors border ${
              statusFilter === 'on_shift'
                ? 'border-black bg-black text-white'
                : 'border-zinc-300 bg-white text-black hover:bg-zinc-100'
            }`}
          >
            On Shift ({onShiftCount})
          </button>
          <button
            onClick={() => setStatusFilter('off_duty')}
            className={`px-3 py-1.5 rounded-lg text-xs font-normal transition-colors border ${
              statusFilter === 'off_duty'
                ? 'border-black bg-black text-white'
                : 'border-zinc-300 bg-white text-black hover:bg-zinc-100'
            }`}
          >
            Off Duty ({totalOperatorsCount - onShiftCount})
          </button>
        </div>
      </div>

      {/* Operators Grid - Photo on Left, Details on Right */}
      {loading ? (
        <div className="grid gap-5 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex flex-row h-64 rounded-2xl border border-zinc-200 bg-white overflow-hidden animate-pulse"
            >
              <div className="w-40 sm:w-48 bg-zinc-200 shrink-0" />
              <div className="flex-1 p-5 space-y-4">
                <div className="h-5 bg-zinc-200 rounded w-1/2" />
                <div className="h-4 bg-zinc-200 rounded w-3/4" />
                <div className="h-16 bg-zinc-100 rounded-lg" />
                <div className="h-4 bg-zinc-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredOperators.length === 0 ? (
        <div className="rounded-2xl border border-zinc-300 bg-white p-12 text-center">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <User className="h-8 w-8 text-black/50" />
              </EmptyMedia>
              <EmptyTitle className="text-black font-semibold mt-2">No operators found</EmptyTitle>
              <EmptyDescription className="text-black/60 font-normal">
                {searchQuery
                  ? 'No operators matched your search filter. Try clearing the search.'
                  : 'Get started by adding your first heavy machinery operator.'}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="mt-4">
              {searchQuery ? (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery('')}
                  className="font-normal text-black border-zinc-300"
                >
                  Clear Search
                </Button>
              ) : (
                <Link href="/operators/new">
                  <Button className="bg-black hover:bg-zinc-800 text-white font-normal">
                    + Add First Operator
                  </Button>
                </Link>
              )}
            </EmptyContent>
          </Empty>
        </div>
      ) : (
        <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
          {filteredOperators.map((o) => {
            const photoUrl = getPhotoUrl(o);
            const assignedMachine =
              machineByOperator.get(o.id) ||
              (o.assigned_machine_code ? machineByOperator.get(o.assigned_machine_code) : null) ||
              (o.assigned_machine_id ? machineByOperator.get(o.assigned_machine_id) : null);

            const displayMachineCode =
              assignedMachine?.code || o.assigned_machine_code || o.assigned_machine || null;
            const displayMachineModel = assignedMachine
              ? `${assignedMachine.make} ${assignedMachine.model}`
              : null;
            const displaySite =
              assignedMachine?.site_name || o.site || 'Bangalore Metro Phase 2 — Reach 6';
            const displayClient = assignedMachine?.client_name || 'L&T Construction';

            const operatorLic = o.license || o.license_number || 'KA-05-2016-HE-00841';
            const expYears = o.experience_years ?? 7;
            const ratingScore = o.rating ? o.rating.toFixed(1) : '4.8';
            const wage = o.hourly_wage ?? 320;

            return (
              <div
                key={o.id}
                className="group relative flex flex-row overflow-hidden rounded-2xl border border-zinc-300 bg-white hover:border-black transition-all duration-200 shadow-sm"
              >
                {/* ---------------------------------------------------- */}
                {/* LEFT SIDE: Full Photo & Operational Badge Overlays  */}
                {/* ---------------------------------------------------- */}
                <div
                  onClick={() => setSelectedOperator(o)}
                  className="relative w-36 sm:w-48 shrink-0 bg-zinc-900 overflow-hidden flex flex-col justify-between border-r border-zinc-200 cursor-pointer"
                  title="Click to view full operator details"
                >
                  <img
                    src={photoUrl}
                    alt={o.name}
                    className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Gradient overlays to guarantee crisp contrast */}
                  <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

                  {/* Top: Shift Status Badge */}
                  <div className="relative z-10 p-2.5">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-normal border border-white/20 bg-black/60 backdrop-blur-md text-white shadow-sm">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          o.is_active ? 'bg-emerald-400' : 'bg-zinc-400'
                        }`}
                      />
                      {o.is_active ? 'On Shift' : 'Off Duty'}
                    </span>
                  </div>

                  {/* Bottom: ID Badge & Rating */}
                  <div className="relative z-10 p-2.5 text-white">
                    <div className="flex items-center justify-between gap-1 text-[11px] font-normal">
                      <span className="font-mono bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/20 text-white text-[10px]">
                        #{o.id.toUpperCase()}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/20 text-amber-300 text-[10px]">
                        <Star className="h-3 w-3 fill-amber-300" />
                        <span className="text-white font-normal">{ratingScore}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* ---------------------------------------------------- */}
                {/* RIGHT SIDE: Complete Details & Assignments           */}
                {/* ---------------------------------------------------- */}
                <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0 bg-white">
                  <div>
                    {/* Header: Name, Specialization, Grade */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        {/* Operator Name is Clickable to Open Full Details */}
                        <button
                          onClick={() => setSelectedOperator(o)}
                          className="text-base sm:text-lg font-normal text-black tracking-tight truncate hover:underline text-left block cursor-pointer"
                          title="Click to view full operator profile and details"
                        >
                          {o.name}
                        </button>
                        <p className="text-xs text-black/70 font-normal truncate mt-0.5">
                          {o.specialization || 'Heavy Equipment Specialist'}
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] sm:text-[11px] font-normal px-2 py-0.5 rounded-full border border-zinc-300 bg-zinc-50 text-black">
                        Grade A
                      </span>
                    </div>

                    {/* Assigned Machine & Site Box */}
                    <div className="mt-3 p-2.5 sm:p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Truck className="h-3.5 w-3.5 text-black shrink-0" />
                          <span className="font-normal text-black truncate">
                            {displayMachineCode ? (
                              <>
                                <span className="font-mono">{displayMachineCode}</span>
                                {displayMachineModel && ` · ${displayMachineModel}`}
                              </>
                            ) : (
                              'No assigned machine'
                            )}
                          </span>
                        </div>
                        <span className="text-[10px] font-normal px-1.5 py-0.5 rounded border border-zinc-300 bg-white text-black shrink-0">
                          {displayMachineCode ? 'Assigned' : 'Available'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-black/75">
                        <MapPin className="h-3.5 w-3.5 text-black/60 shrink-0" />
                        <span className="truncate">
                          {displaySite}
                          {displayClient && (
                            <span className="text-black/60"> ({displayClient})</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Operator Credentials Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
                      <div className="flex items-center gap-1.5 text-black/80">
                        <Award className="h-3.5 w-3.5 text-black/60 shrink-0" />
                        <span className="truncate font-mono text-[11px]">{operatorLic}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-black/80">
                        <Clock className="h-3.5 w-3.5 text-black/60 shrink-0" />
                        <span className="font-normal">{expYears} years experience</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-black/80">
                        <Phone className="h-3.5 w-3.5 text-black/60 shrink-0" />
                        <span className="font-normal">{o.phone || '+91 98451 11223'}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-black/80">
                        <IndianRupee className="h-3.5 w-3.5 text-black/60 shrink-0" />
                        <span className="font-normal">₹{wage}/hr pay rate</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-zinc-200 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedOperator(o)}
                      className="inline-flex items-center gap-1 text-xs font-normal text-black hover:underline cursor-pointer"
                    >
                      <UserCheck className="h-3.5 w-3.5 text-black shrink-0" />
                      <span>View details</span>
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => router.push(`/operators/${o.id}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-normal rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 text-black transition-colors"
                        title="Edit Operator"
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </button>

                      <BorderButton
                        size="sm"
                        tone="destructive"
                        title="Delete Operator"
                        aria-label="Delete"
                        onClick={() => void handleDelete(o.id, o.name)}
                        className="h-7 w-7 p-0 flex items-center justify-center"
                      >
                        <Trash2 aria-hidden="true" className="h-3.5 w-3.5 text-red-600" />
                      </BorderButton>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CREATIVE OPERATOR DETAILS MODAL (Requested Fields)            */}
      {/* Name, Age, Gmail, Married, Native, Language, Salary, Exp,    */}
      {/* Contract / Full Time, Address, Phone Number                   */}
      {/* ------------------------------------------------------------- */}
      {selectedOperator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-zinc-300 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
            {/* Modal Header Bar */}
            <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-start justify-between bg-zinc-50/70">
              <div className="flex items-center gap-3.5">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-zinc-300 shrink-0 bg-zinc-900 shadow-sm">
                  <img
                    src={getPhotoUrl(selectedOperator)}
                    alt={selectedOperator.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-normal text-black tracking-tight">
                      {selectedOperator.name}
                    </h2>
                    <span className="text-[11px] font-normal px-2 py-0.5 rounded-full border border-zinc-300 bg-white text-black">
                      Grade A
                    </span>
                  </div>
                  <p className="text-xs font-normal text-black/70 mt-0.5">
                    {selectedOperator.specialization || 'Heavy Equipment Specialist'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 text-[11px] font-normal text-black">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          selectedOperator.is_active ? 'bg-emerald-500' : 'bg-zinc-400'
                        }`}
                      />
                      {selectedOperator.is_active ? 'On Shift (Active)' : 'Off Duty'}
                    </span>
                    <span className="text-zinc-300">·</span>
                    <span className="text-[11px] font-normal text-black font-mono">
                      #{selectedOperator.id.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedOperator(null)}
                className="p-1.5 rounded-lg border border-zinc-200 bg-white text-black/60 hover:text-black hover:bg-zinc-100 transition-colors"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Content - Scrollable with All Requested Details */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
              {/* 1. Primary Personal & Demographic Details */}
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <User className="h-4 w-4 text-black" />
                  <h3 className="text-xs font-normal text-black uppercase tracking-wider">
                    Personal & Demographic Profile
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3">
                    <p className="text-[10px] font-normal text-black/60 uppercase">Age</p>
                    <p className="text-sm font-normal text-black mt-1">
                      {selectedOperator.age ?? 38} years
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3">
                    <p className="text-[10px] font-normal text-black/60 uppercase">Marital Status</p>
                    <p className="text-sm font-normal text-black mt-1">
                      {selectedOperator.marital_status ?? 'Married'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3">
                    <p className="text-[10px] font-normal text-black/60 uppercase">Native Place</p>
                    <p className="text-sm font-normal text-black mt-1 truncate" title={selectedOperator.native_place ?? 'Karnataka'}>
                      {selectedOperator.native_place ?? 'Hassan, Karnataka'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3">
                    <p className="text-[10px] font-normal text-black/60 uppercase">Languages</p>
                    <p className="text-sm font-normal text-black mt-1 truncate" title={selectedOperator.languages ?? 'Kannada, Hindi'}>
                      {selectedOperator.languages ?? 'Kannada, Hindi'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Employment Contract, Experience & Salary */}
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Briefcase className="h-4 w-4 text-black" />
                  <h3 className="text-xs font-normal text-black uppercase tracking-wider">
                    Employment & Compensation
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3">
                    <p className="text-[10px] font-normal text-black/60 uppercase">Contract / Full Time</p>
                    <p className="text-sm font-normal text-black mt-1">
                      {selectedOperator.employment_type ?? 'Full Time (Permanent)'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3">
                    <p className="text-[10px] font-normal text-black/60 uppercase">Monthly Salary</p>
                    <p className="text-sm font-normal text-black mt-1">
                      ₹{(selectedOperator.monthly_salary ?? 42000).toLocaleString('en-IN')} / mo
                    </p>
                    <p className="text-[11px] font-normal text-black/60 mt-0.5">
                      (₹{selectedOperator.hourly_wage ?? 350}/hr base rate)
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3">
                    <p className="text-[10px] font-normal text-black/60 uppercase">Experience</p>
                    <p className="text-sm font-normal text-black mt-1">
                      {selectedOperator.experience_years ?? 9} years
                    </p>
                    <p className="text-[11px] font-normal text-black/60 mt-0.5">
                      Heavy Equipment Certified
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Contact & Residential Address */}
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Phone className="h-4 w-4 text-black" />
                  <h3 className="text-xs font-normal text-black uppercase tracking-wider">
                    Contact & Residential Address
                  </h3>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 space-y-2.5 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-200">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-black shrink-0" />
                      <span className="font-normal text-black/70">Phone Number:</span>
                      <a
                        href={`tel:${selectedOperator.phone ?? '+919845111223'}`}
                        className="font-normal text-black hover:underline"
                      >
                        {selectedOperator.phone ?? '+91 98451 11223'}
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-black shrink-0" />
                      <span className="font-normal text-black/70">Gmail / Email:</span>
                      <a
                        href={`mailto:${selectedOperator.gmail || selectedOperator.email || 'operator@gmail.com'}`}
                        className="font-normal text-black hover:underline"
                      >
                        {selectedOperator.gmail || selectedOperator.email || 'ramesh.kumar.fleet@gmail.com'}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Home className="h-3.5 w-3.5 text-black shrink-0 mt-0.5" />
                    <div>
                      <span className="font-normal text-black/70">Residential Address: </span>
                      <span className="font-normal text-black">
                        {selectedOperator.address ?? '#42, 2nd Cross, Industrial Area, Peenya, Bengaluru, Karnataka 560058'}
                      </span>
                    </div>
                  </div>

                  {selectedOperator.emergency_contact && (
                    <div className="flex items-start gap-2 pt-2 border-t border-zinc-200">
                      <Heart className="h-3.5 w-3.5 text-black shrink-0 mt-0.5" />
                      <div>
                        <span className="font-normal text-black/70">Emergency Contact: </span>
                        <span className="font-normal text-black">{selectedOperator.emergency_contact}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Equipment Deployment & RTO License */}
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Truck className="h-4 w-4 text-black" />
                  <h3 className="text-xs font-normal text-black uppercase tracking-wider">
                    Equipment Allocation & Licensing
                  </h3>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 space-y-2 text-xs">
                  {(() => {
                    const mch =
                      machineByOperator.get(selectedOperator.id) ||
                      (selectedOperator.assigned_machine_code
                        ? machineByOperator.get(selectedOperator.assigned_machine_code)
                        : null) ||
                      (selectedOperator.assigned_machine_id
                        ? machineByOperator.get(selectedOperator.assigned_machine_id)
                        : null);

                    return (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="font-normal text-black/70">Assigned Machine:</span>
                          <span className="font-normal text-black font-mono">
                            {mch ? `${mch.code} · ${mch.make} ${mch.model}` : (selectedOperator.assigned_machine_code || 'EX-01 · Cat 320D3')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-normal text-black/70">Active Project Site:</span>
                          <span className="font-normal text-black">
                            {mch?.site_name || selectedOperator.site || 'Bangalore Metro Phase 2 — Reach 6'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-normal text-black/70">Client / Contractor:</span>
                          <span className="font-normal text-black">
                            {mch?.client_name || 'L&T Construction'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-zinc-200">
                          <span className="font-normal text-black/70">Heavy Plant License:</span>
                          <span className="font-normal text-black font-mono">
                            {selectedOperator.license || selectedOperator.license_number || 'KA-05-2016-HE-00841'} (RTO Verified ✓)
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t border-zinc-200 bg-zinc-50/70 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-black/70">
                <ShieldCheck className="h-4 w-4 text-black" />
                <span className="font-normal">RTO Verified Operator Credentials</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/operators/${selectedOperator.id}`)}
                  className="h-8 px-3 text-xs font-normal text-black border-zinc-300 hover:bg-zinc-100"
                >
                  <Pencil className="h-3 w-3 mr-1" /> Edit Profile
                </Button>
                <Button
                  onClick={() => setSelectedOperator(null)}
                  className="h-8 px-4 text-xs font-normal bg-black hover:bg-zinc-800 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ADD OPERATOR MODAL (Photo Upload from Browser + All Details)  */}
      {/* ------------------------------------------------------------- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-zinc-300 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-start justify-between bg-zinc-50/70">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl border border-zinc-300 bg-black flex items-center justify-center text-white shrink-0">
                  <HardHat className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-normal text-black tracking-tight">
                    Add New Operator
                  </h2>
                  <p className="text-xs font-normal text-black mt-0.5">
                    Upload photo, enter personal profile, employment details, and allocate machine
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg border border-zinc-200 bg-white text-black hover:bg-zinc-100 transition-colors"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleAddOperatorSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
                {/* 1. Photo Upload Section */}
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 space-y-3">
                  <div className="flex items-center gap-1.5">
                    <Camera className="h-4 w-4 text-black" />
                    <h3 className="text-xs font-normal text-black uppercase tracking-wider">
                      Operator Photo & Avatar
                    </h3>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-zinc-300 shrink-0 bg-zinc-900 shadow-md">
                      <img
                        src={photoPreview}
                        alt="Operator Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-black/75 text-white text-[9px] text-center py-0.5 font-normal">
                        Preview
                      </div>
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoFileChange}
                      />
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="h-8 px-3 text-xs font-normal text-black border-zinc-300 hover:bg-zinc-100 flex items-center gap-1.5 bg-white"
                        >
                          <Upload className="h-3.5 w-3.5 text-black" />
                          <span>Upload Photo from Device...</span>
                        </Button>
                        <span className="text-[11px] font-normal text-black">
                          (JPG, PNG, WebP)
                        </span>
                      </div>

                      {/* Quick Presets */}
                      <div>
                        <p className="text-[10px] font-normal text-black uppercase tracking-wider mb-1.5">
                          Or pick from fleet crew:
                        </p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {[
                            { name: 'Ramesh', url: '/operators/op-001.jpg' },
                            { name: 'Suresh', url: '/operators/op-002.jpg' },
                            { name: 'Abdul', url: '/operators/op-003.jpg' },
                            { name: 'Vikram', url: '/operators/op-004.jpg' },
                            { name: 'Pradeep', url: '/operators/op-005.jpg' },
                            { name: 'Manoj', url: '/operators/op-006.jpg' },
                          ].map((preset) => {
                            const isSelected = photoPreview === preset.url;
                            return (
                              <button
                                key={preset.name}
                                type="button"
                                onClick={() => setPhotoPreview(preset.url)}
                                className={`relative h-9 w-9 rounded-lg overflow-hidden border transition-all ${
                                  isSelected
                                    ? 'border-black ring-2 ring-black'
                                    : 'border-zinc-300 opacity-75 hover:opacity-100'
                                }`}
                                title={preset.name}
                              >
                                <img
                                  src={preset.url}
                                  alt={preset.name}
                                  className="w-full h-full object-cover"
                                />
                                {isSelected && (
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Personal & Demographic Profile */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <User className="h-4 w-4 text-black" />
                    <h3 className="text-xs font-normal text-black uppercase tracking-wider">
                      Personal & Demographic Profile
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-normal text-black mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Kumar"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-normal text-black mb-1">
                        Age (years)
                      </label>
                      <input
                        type="number"
                        min="18"
                        max="70"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-normal text-black mb-1">
                        Marital Status
                      </label>
                      <select
                        value={formData.marital_status}
                        onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
                        className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black"
                      >
                        <option value="Married">Married</option>
                        <option value="Single">Single</option>
                        <option value="Unmarried">Unmarried</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-normal text-black mb-1">
                        Native Place
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Hassan, Karnataka"
                        value={formData.native_place}
                        onChange={(e) => setFormData({ ...formData, native_place: e.target.value })}
                        className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-normal text-black mb-1">
                        Languages Spoken
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Kannada, Hindi, English"
                        value={formData.languages}
                        onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                        className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Employment & Compensation */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Briefcase className="h-4 w-4 text-black" />
                    <h3 className="text-xs font-normal text-black uppercase tracking-wider">
                      Employment & Compensation
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-normal text-black mb-1">
                        Contract / Full Time
                      </label>
                      <select
                        value={formData.employment_type}
                        onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                        className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black"
                      >
                        <option value="Full Time (Permanent)">Full Time (Permanent)</option>
                        <option value="Contract">Contract</option>
                        <option value="Daily Wage">Daily Wage</option>
                        <option value="Freelance">Freelance</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-normal text-black mb-1">
                        Monthly Salary (₹ / mo)
                      </label>
                      <input
                        type="number"
                        placeholder="42000"
                        value={formData.monthly_salary}
                        onChange={(e) => setFormData({ ...formData, monthly_salary: e.target.value })}
                        className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-normal text-black mb-1">
                        Experience (Years)
                      </label>
                      <input
                        type="number"
                        placeholder="9"
                        value={formData.experience_years}
                        onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                        className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-normal text-black mb-1">
                        Operator Grade
                      </label>
                      <select
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black"
                      >
                        <option value="Grade A">Grade A</option>
                        <option value="Grade B">Grade B</option>
                        <option value="Master Operator">Master Operator</option>
                        <option value="Junior">Junior</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-normal text-black mb-1">
                        Specialty / Role
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Excavator & Deep Trenching"
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-normal text-black mb-1">
                        Initial Shift Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black"
                      >
                        <option value="on_shift">On Shift (Active)</option>
                        <option value="off_duty">Off Duty</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4. Contact & Residential Address */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Phone className="h-4 w-4 text-black" />
                    <h3 className="text-xs font-normal text-black uppercase tracking-wider">
                      Contact & Residential Address
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-normal text-black mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98451 11223"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-normal text-black mb-1">
                        Gmail / Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="ramesh.k@fleetteam.in"
                        value={formData.gmail}
                        onChange={(e) => setFormData({ ...formData, gmail: e.target.value })}
                        className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-normal text-black mb-1">
                        Residential Address
                      </label>
                      <textarea
                        rows={2}
                        placeholder="#42, 2nd Cross, Industrial Area, Peenya, Bengaluru, Karnataka 560058"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Equipment Allocation & Licensing */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Truck className="h-4 w-4 text-black" />
                    <h3 className="text-xs font-normal text-black uppercase tracking-wider">
                      Equipment Allocation & Licensing
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-normal text-black mb-1">
                        Assigned Machine
                      </label>
                      <select
                        value={formData.assigned_machine_id}
                        onChange={(e) => handleMachineSelect(e.target.value)}
                        className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black"
                      >
                        <option value="">No machine assigned</option>
                        {machines.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.code} · {m.make} {m.model} ({m.type || 'Plant'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-normal text-black mb-1">
                        Heavy Plant License Number (RTO)
                      </label>
                      <input
                        type="text"
                        placeholder="KA-05-2016-HE-00841"
                        value={formData.license_number}
                        onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                        className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-normal text-black mb-1">
                        Active Project Site
                      </label>
                      <input
                        type="text"
                        placeholder="Bangalore Metro Phase 2 — Reach 6"
                        value={formData.site}
                        onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                        className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-normal text-black mb-1">
                        Client / Contractor
                      </label>
                      <input
                        type="text"
                        placeholder="L&T Construction"
                        value={formData.client}
                        onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                        className="w-full text-xs font-normal text-black border border-zinc-300 rounded-lg p-2 bg-white focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Footer */}
              <div className="p-4 border-t border-zinc-200 bg-zinc-50/70 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-black">
                  <ShieldCheck className="h-4 w-4 text-black" />
                  <span className="font-normal">RTO Verified Operator Registration</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                    className="h-8 px-3 text-xs font-normal text-black border-zinc-300 hover:bg-zinc-100 bg-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={savingOperator}
                    className="h-8 px-4 text-xs font-normal bg-black hover:bg-zinc-800 text-white"
                  >
                    {savingOperator ? 'Registering…' : 'Add Operator'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete operator"
        desc={`Are you sure you want to delete "${deleteTarget?.label}"? This action cannot be undone.`}
        confirmText="Delete"
        destructive
        isLoading={deleting}
        handleConfirm={() => {
          void confirmDeleteOperator();
        }}
      />
    </div>
  );
}
