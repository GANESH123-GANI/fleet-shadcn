'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Truck,
  MapPin,
  Calendar,
  Pencil,
  Trash2,
  Search,
  ArrowRight,
  Gauge,
  Fuel,
  User,
  Clock,
  AlertTriangle,
  Plus,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchList } from '@/lib/api/fetch-list';
import { apiDelete } from '@/lib/api/mutations';
import { ConfirmDialog } from '@/components/confirm-dialog';

// ---------------------------------------------------------------------------
// Client Corporate Company Brand Logos
// ---------------------------------------------------------------------------

function LTLogo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center rounded-lg bg-black text-white shrink-0 shadow-sm ${className}`}>
      <svg viewBox="0 0 40 40" className="h-5 w-5" fill="none">
        <polygon points="20,4 36,20 20,36 4,20" stroke="#FFFFFF" strokeWidth="2.2" fill="none" />
        <text x="20" y="24" fontSize="10" fontWeight="700" fill="#FFFFFF" textAnchor="middle" fontFamily="sans-serif">L&T</text>
      </svg>
    </div>
  );
}

function TataLogo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center rounded-lg bg-black text-white shrink-0 shadow-sm ${className}`}>
      <svg viewBox="0 0 40 40" className="h-5 w-5" fill="none">
        <circle cx="20" cy="20" r="15" stroke="#FFFFFF" strokeWidth="2" fill="none" />
        <path d="M 12 16 Q 20 12 28 16" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M 14 21 Q 20 17 26 21" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <text x="20" y="30" fontSize="7" fontWeight="700" fill="#FFFFFF" textAnchor="middle" letterSpacing="1" fontFamily="sans-serif">TATA</text>
      </svg>
    </div>
  );
}

function AfconsLogo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center rounded-lg bg-black text-white shrink-0 shadow-sm ${className}`}>
      <svg viewBox="0 0 40 40" className="h-5 w-5" fill="none">
        <polygon points="20,5 33,12 33,28 20,35 7,28 7,12" stroke="#FFFFFF" strokeWidth="2" fill="none" />
        <path d="M 14 26 L 20 13 L 26 26" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="16" y1="22" x2="24" y2="22" stroke="#FFFFFF" strokeWidth="1.8" />
      </svg>
    </div>
  );
}

function ShapoorjiLogo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center rounded-lg bg-black text-white shrink-0 shadow-sm ${className}`}>
      <svg viewBox="0 0 40 40" className="h-5 w-5" fill="none">
        <rect x="6" y="6" width="28" height="28" rx="6" stroke="#FFFFFF" strokeWidth="2" fill="none" />
        <text x="20" y="24" fontSize="13" fontWeight="700" fill="#FFFFFF" textAnchor="middle" letterSpacing="0.5" fontFamily="sans-serif">SP</text>
      </svg>
    </div>
  );
}

function DilipLogo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center rounded-lg bg-black text-white shrink-0 shadow-sm ${className}`}>
      <svg viewBox="0 0 40 40" className="h-5 w-5" fill="none">
        <path d="M 8 30 Q 15 10 32 10" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M 12 32 Q 22 18 32 18" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="2,2" fill="none" />
        <text x="20" y="32" fontSize="7" fontWeight="700" fill="#FFFFFF" textAnchor="middle" letterSpacing="1" fontFamily="sans-serif">DBL</text>
      </svg>
    </div>
  );
}

function ClientCompanyLogo({ clientName, className = 'h-8 w-8' }: { clientName: string; className?: string }) {
  const c = (clientName || '').toLowerCase();
  if (c.includes('l&t') || c.includes('larsen')) return <LTLogo className={className} />;
  if (c.includes('tata')) return <TataLogo className={className} />;
  if (c.includes('afcon')) return <AfconsLogo className={className} />;
  if (c.includes('shapoorji') || c.includes('sp')) return <ShapoorjiLogo className={className} />;
  if (c.includes('dilip') || c.includes('dbl')) return <DilipLogo className={className} />;
  return <LTLogo className={className} />;
}

// ---------------------------------------------------------------------------
// Compact CAD Side Profile Machine Diagrams
// ---------------------------------------------------------------------------

function ExcavatorCAD({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 130" className={`w-full h-full ${className}`}>
      <line x1="10" y1="118" x2="210" y2="118" stroke="#D4D4D8" strokeWidth="1" strokeDasharray="3,3" />
      <rect x="28" y="96" width="104" height="20" rx="8" fill="#E4E4E7" stroke="#000000" strokeWidth="1.8" />
      <circle cx="40" cy="106" r="7" fill="#52525B" />
      <circle cx="120" cy="106" r="7" fill="#52525B" />
      <circle cx="62" cy="108" r="4.5" fill="#000000" />
      <circle cx="80" cy="108" r="4.5" fill="#000000" />
      <circle cx="98" cy="108" r="4.5" fill="#000000" />
      <line x1="28" y1="106" x2="132" y2="106" stroke="#000000" strokeWidth="1" strokeDasharray="4,3" />

      <path d="M 36 96 L 36 68 Q 38 56 48 56 L 94 56 L 94 96 Z" fill="#F4F4F5" stroke="#000000" strokeWidth="1.8" />
      <path d="M 76 96 L 76 46 L 108 46 L 114 68 L 114 96 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.8" />
      <polygon points="82,50 105,50 110,68 82,68" fill="#E4E4E7" stroke="#000000" strokeWidth="1.2" />

      <path d="M 96 78 Q 120 28 148 40 L 152 46 Q 124 38 102 84 Z" fill="#E4E4E7" stroke="#000000" strokeWidth="1.8" />
      <line x1="88" y1="84" x2="122" y2="46" stroke="#000000" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M 148 40 L 180 82 L 174 86 L 144 46 Z" fill="#F4F4F5" stroke="#000000" strokeWidth="1.8" />
      <path d="M 180 82 Q 198 88 194 104 L 176 104 Q 172 90 174 86 Z" fill="#D4D4D8" stroke="#000000" strokeWidth="1.8" />
      <polygon points="194,104 199,107 192,107" fill="#000000" />
      <polygon points="188,104 193,107 186,107" fill="#000000" />
    </svg>
  );
}

function DozerCAD({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 130" className={`w-full h-full ${className}`}>
      <line x1="10" y1="118" x2="210" y2="118" stroke="#D4D4D8" strokeWidth="1" strokeDasharray="3,3" />
      <circle cx="58" cy="78" r="11" fill="#52525B" stroke="#000000" strokeWidth="1.5" />
      <circle cx="44" cy="106" r="9" fill="#52525B" stroke="#000000" strokeWidth="1.5" />
      <circle cx="130" cy="106" r="9" fill="#52525B" stroke="#000000" strokeWidth="1.5" />
      <path
        d="M 44 97 L 54 69 A 11 11 0 0 1 66 71 L 126 99 A 9 9 0 0 1 130 115 L 44 115 A 9 9 0 0 1 44 97 Z"
        fill="#E4E4E7"
        stroke="#000000"
        strokeWidth="1.8"
      />
      <path d="M 52 86 L 52 66 L 70 66 L 80 48 L 118 48 L 128 72 L 128 92 Z" fill="#F4F4F5" stroke="#000000" strokeWidth="1.8" />
      <polygon points="74,66 78,40 108,40 114,66" fill="#FFFFFF" stroke="#000000" strokeWidth="1.8" />
      <line x1="68" y1="96" x2="148" y2="94" stroke="#000000" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M 148 72 Q 160 92 154 114 L 144 114 Q 148 94 140 72 Z" fill="#D4D4D8" stroke="#000000" strokeWidth="1.8" />
    </svg>
  );
}

function DumpTruckCAD({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 130" className={`w-full h-full ${className}`}>
      <line x1="10" y1="118" x2="210" y2="118" stroke="#D4D4D8" strokeWidth="1" strokeDasharray="3,3" />
      <circle cx="56" cy="102" r="16" fill="#000000" stroke="#000000" strokeWidth="1.8" />
      <circle cx="56" cy="102" r="7" fill="#E4E4E7" />
      <circle cx="140" cy="102" r="16" fill="#000000" stroke="#000000" strokeWidth="1.8" />
      <circle cx="140" cy="102" r="7" fill="#E4E4E7" />
      <circle cx="174" cy="102" r="16" fill="#000000" stroke="#000000" strokeWidth="1.8" />
      <circle cx="174" cy="102" r="7" fill="#E4E4E7" />
      <rect x="40" y="86" width="144" height="6" fill="#000000" />
      <path d="M 36 86 L 36 68 Q 38 48 48 46 L 78 46 L 82 86 Z" fill="#F4F4F5" stroke="#000000" strokeWidth="1.8" />
      <path d="M 86 84 L 86 42 L 54 34 L 54 30 L 100 38 L 190 38 L 196 74 L 188 84 Z" fill="#E4E4E7" stroke="#000000" strokeWidth="1.8" />
      <line x1="114" y1="44" x2="114" y2="82" stroke="#71717A" strokeWidth="1.5" />
      <line x1="138" y1="44" x2="138" y2="82" stroke="#71717A" strokeWidth="1.5" />
    </svg>
  );
}

function WheelLoaderCAD({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 130" className={`w-full h-full ${className}`}>
      <line x1="10" y1="118" x2="210" y2="118" stroke="#D4D4D8" strokeWidth="1" strokeDasharray="3,3" />
      <circle cx="56" cy="98" r="20" fill="#000000" stroke="#000000" strokeWidth="1.8" />
      <circle cx="56" cy="98" r="9" fill="#E4E4E7" />
      <circle cx="128" cy="98" r="20" fill="#000000" stroke="#000000" strokeWidth="1.8" />
      <circle cx="128" cy="98" r="9" fill="#E4E4E7" />
      <path d="M 38 88 L 38 64 L 84 64 L 88 88 Z" fill="#F4F4F5" stroke="#000000" strokeWidth="1.8" />
      <path d="M 74 64 L 78 40 L 102 40 L 106 64 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.8" />
      <path d="M 96 78 L 152 74 L 174 96 L 168 98 L 148 78 L 96 84 Z" fill="#E4E4E7" stroke="#000000" strokeWidth="1.8" />
      <path d="M 174 96 Q 196 98 194 72 L 182 72 Q 182 90 166 94 Z" fill="#D4D4D8" stroke="#000000" strokeWidth="1.8" />
    </svg>
  );
}

function BackhoeCAD({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 130" className={`w-full h-full ${className}`}>
      <line x1="10" y1="118" x2="210" y2="118" stroke="#D4D4D8" strokeWidth="1" strokeDasharray="3,3" />
      <circle cx="82" cy="94" r="22" fill="#000000" stroke="#000000" strokeWidth="1.8" />
      <circle cx="82" cy="94" r="10" fill="#E4E4E7" />
      <circle cx="142" cy="102" r="14" fill="#000000" stroke="#000000" strokeWidth="1.8" />
      <circle cx="142" cy="102" r="6" fill="#E4E4E7" />
      <path d="M 68 84 L 72 44 L 106 44 L 110 84 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.8" />
      <path d="M 110 84 L 110 68 L 148 68 L 148 88 Z" fill="#F4F4F5" stroke="#000000" strokeWidth="1.8" />
      <line x1="108" y1="78" x2="174" y2="92" stroke="#000000" strokeWidth="3.5" />
      <path d="M 174 92 Q 192 94 190 76 L 180 76 Q 180 88 170 90 Z" fill="#E4E4E7" stroke="#000000" strokeWidth="1.8" />
      <path d="M 60 78 Q 44 48 30 62 L 26 66 Q 38 54 56 82 Z" fill="#E4E4E7" stroke="#000000" strokeWidth="1.8" />
    </svg>
  );
}

function MachineCAD({ type, className = '' }: { type: string; className?: string }) {
  const t = (type || '').toLowerCase();
  if (t.includes('dozer')) return <DozerCAD className={className} />;
  if (t.includes('dump') || t.includes('tipper') || t.includes('truck')) return <DumpTruckCAD className={className} />;
  if (t.includes('wheel') || (t.includes('loader') && !t.includes('backhoe'))) return <WheelLoaderCAD className={className} />;
  if (t.includes('backhoe')) return <BackhoeCAD className={className} />;
  return <ExcavatorCAD className={className} />;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function num(v: unknown, fallback = 0): number {
  const n = typeof v === 'string' ? Number(v) : (v as number);
  return Number.isFinite(n) ? n : fallback;
}

function fmtInt(n: number): string {
  return Math.round(n).toLocaleString('en-IN');
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DeploymentEntry {
  id: string;
  machine_id: string;
  site_id: string;
  site_name?: string;
  machine_code?: string;
  machine_type?: string;
  start_date: string;
  end_date?: string;
  status: string;
}

// ---------------------------------------------------------------------------
// Main Deployments Page Component
// ---------------------------------------------------------------------------

export default function DeploymentsList() {
  const router = useRouter();
  const [deployments, setDeployments] = useState<DeploymentEntry[]>([]);
  const [machines, setMachines] = useState<Record<string, unknown>[]>([]);
  const [sites, setSites] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSite, setSelectedSite] = useState('all');

  useEffect(() => {
    void Promise.all([
      fetchList<DeploymentEntry>('/api/v1/deployments'),
      fetchList<Record<string, unknown>>('/api/v1/machines'),
      fetchList<Record<string, unknown>>('/api/v1/sites'),
    ])
      .then(([deps, machs, stes]) => {
        setDeployments(deps);
        setMachines(machs);
        setSites(stes);
      })
      .catch(() => {
        setDeployments([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const machineMap = useMemo(() => {
    const map = new Map<string, Record<string, unknown>>();
    machines.forEach((m) => {
      map.set(String(m.id), m);
      if (m.code) map.set(String(m.code), m);
    });
    return map;
  }, [machines]);

  const siteMap = useMemo(() => {
    const map = new Map<string, Record<string, unknown>>();
    sites.forEach((s) => {
      map.set(String(s.id), s);
      if (s.name) map.set(String(s.name), s);
    });
    return map;
  }, [sites]);

  const handleDelete = (id: string, label: string) => setDeleteTarget({ id, label });

  const confirmDeleteDeployment = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiDelete(`/api/v1/deployments/${deleteTarget.id}`);
      setDeployments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  // Filtered Deployments
  const filteredDeployments = useMemo(() => {
    return deployments.filter((d) => {
      const mach = machineMap.get(String(d.machine_id)) || machineMap.get(String(d.machine_code));
      const ste = siteMap.get(String(d.site_id)) || siteMap.get(String(d.site_name));

      const code = String(d.machine_code ?? mach?.code ?? '').toLowerCase();
      const sname = String(d.site_name ?? ste?.name ?? '').toLowerCase();
      const cname = String(ste?.client_name ?? mach?.client_name ?? '').toLowerCase();
      const q = searchQuery.toLowerCase();

      const matchesSearch = !q || code.includes(q) || sname.includes(q) || cname.includes(q);

      const status = String(d.status ?? '').toLowerCase();
      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'active' && status === 'active') ||
        (selectedStatus === 'hold' && status.includes('hold'));

      const matchesSite = selectedSite === 'all' || sname.includes(selectedSite.toLowerCase());

      return matchesSearch && matchesStatus && matchesSite;
    });
  }, [deployments, machineMap, siteMap, searchQuery, selectedStatus, selectedSite]);

  const activeCount = useMemo(() => deployments.filter((d) => d.status === 'active').length, [deployments]);
  const holdCount = useMemo(() => deployments.filter((d) => d.status.includes('hold')).length, [deployments]);

  return (
    <div className="space-y-4 text-black">
      {/* Page Header (Solid Black Font) */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-normal tracking-tight text-black">Deployments Management</h1>
          <p className="text-[11px] font-normal text-black">
            Active equipment allocation, jobsite telemetry, and client assignment
          </p>
        </div>
        <Link href="/deployments/new">
          <Button size="sm" className="h-8 bg-black hover:bg-zinc-800 text-white text-xs font-normal">
            <Plus className="mr-1 h-3.5 w-3.5 text-white" /> New Deployment
          </Button>
        </Link>
      </div>

      {/* Top 4 Deployments KPI Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-black">
        <div className="rounded-lg border border-zinc-300 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-normal text-black">Total Deployed Assets</span>
            <Truck className="h-3.5 w-3.5 text-black" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-normal text-black">{deployments.length}</span>
            <span className="text-[10px] font-normal text-black">machines</span>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-300 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-normal text-black">Operational on Site</span>
            <ShieldCheck className="h-3.5 w-3.5 text-black" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-normal text-black">{activeCount}</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-normal text-black">
              <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" /> active
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-300 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-normal text-black">Review / On Hold</span>
            <Clock className="h-3.5 w-3.5 text-black" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-normal text-black">{holdCount}</span>
            <span className="text-[10px] font-normal text-black">payment review</span>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-300 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-normal text-black">Active Project Sites</span>
            <MapPin className="h-3.5 w-3.5 text-black" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-normal text-black">{sites.length > 0 ? sites.length : 5}</span>
            <span className="text-[10px] font-normal text-black">work zones</span>
          </div>
        </div>
      </div>

      {/* Compact Search & Filters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-300 bg-white p-2 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-black" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search machine, site, or client..."
            className="w-full rounded-md border border-zinc-300 bg-zinc-50 py-1 pl-8 pr-2.5 text-xs font-normal text-black placeholder:text-zinc-600 outline-none focus:border-black"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-md border border-zinc-300 bg-zinc-50 py-1 px-2.5 text-xs font-normal text-black outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active Operational</option>
            <option value="hold">On Hold</option>
          </select>

          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="rounded-md border border-zinc-300 bg-zinc-50 py-1 px-2.5 text-xs font-normal text-black outline-none"
          >
            <option value="all">All Sites</option>
            <option value="metro">Bangalore Metro</option>
            <option value="coastal">Coastal Roadway</option>
            <option value="airport">Kempegowda Airport</option>
            <option value="highway">NH-44 Highway</option>
          </select>
        </div>
      </div>

      {/* Creative Deployments Grid */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 rounded-lg border border-zinc-300 bg-white p-4 animate-pulse">
              <div className="h-3 bg-zinc-300 rounded w-1/3 mb-2"></div>
              <div className="h-2.5 bg-zinc-200 rounded w-1/2 mb-4"></div>
              <div className="h-20 bg-zinc-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredDeployments.length === 0 ? (
        <div className="rounded-lg border border-zinc-300 bg-white p-8 text-center shadow-sm">
          <Truck className="mx-auto h-6 w-6 text-black" />
          <h3 className="mt-2 text-xs font-normal text-black">No matching deployments</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setSearchQuery(''); setSelectedStatus('all'); setSelectedSite('all'); }}
            className="mt-3 h-7 text-xs font-normal text-black border-black"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDeployments.map((d) => {
            const mach = machineMap.get(String(d.machine_id)) || machineMap.get(String(d.machine_code));
            const ste = siteMap.get(String(d.site_id)) || siteMap.get(String(d.site_name));

            const machineCode = String(d.machine_code ?? mach?.code ?? 'EX-01');
            const machineType = String(mach?.type ?? d.machine_type ?? 'excavator');
            const machineMake = String(mach?.make ?? 'Caterpillar');
            const machineModel = String(mach?.model ?? machineType);
            const siteName = String(d.site_name ?? ste?.name ?? 'Bangalore Metro Phase 2 — Reach 6');
            const clientName = String(ste?.client_name ?? mach?.client_name ?? 'L&T Construction');
            const currentMeter = num(mach?.current_meter, 4280.5);
            const fuelPct = num(mach?.fuel_level_pct, 68);
            const hourlyRate = num(mach?.hourly_rate, 2500);
            const opName = String(mach?.operator_name ?? 'Ramesh Kumar');
            const isHold = d.status.includes('hold');

            return (
              <div
                key={d.id}
                className="group flex flex-col justify-between rounded-lg border border-zinc-300 bg-white p-3.5 shadow-sm hover:border-black transition-all text-black"
              >
                <div>
                  {/* Top Row: Corporate Logo + Site / Client Header */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5 min-w-0">
                      {/* Authentic Corporate Brand Logo */}
                      <ClientCompanyLogo clientName={clientName} className="h-8 w-8 shrink-0" />

                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-normal text-black truncate flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-black shrink-0" />
                          <span>{clientName}</span>
                        </p>
                        <p className="text-xs font-normal text-black truncate" title={siteName}>
                          {siteName}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-normal shrink-0 ${
                        isHold ? 'border-zinc-400 bg-zinc-100 text-black' : 'border-zinc-400 bg-zinc-50 text-black'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${isHold ? 'bg-zinc-600' : 'bg-black animate-pulse'}`} />
                      {isHold ? 'On Hold' : 'Active'}
                    </span>
                  </div>

                  {/* Machine CAD Blueprint & Telemetry Strip */}
                  <div className="mt-2.5 flex items-center justify-between gap-2 rounded-md border border-zinc-200 bg-zinc-50/80 p-2">
                    {/* CAD Side Diagram */}
                    <div className="h-12 w-24 shrink-0 flex items-center justify-center">
                      <MachineCAD type={machineType} />
                    </div>

                    {/* Machine Identity & Telemetry */}
                    <div className="flex-1 space-y-0.5 text-right text-[11px]">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/machines/${d.machine_id}`}
                          className="font-normal text-black hover:underline"
                        >
                          {machineCode}
                        </Link>
                        <span className="text-[9px] uppercase px-1 rounded bg-zinc-200 text-black">
                          {machineMake}
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-1 text-[10px]">
                        <Gauge className="h-2.5 w-2.5 text-black" />
                        <span className="font-normal text-black">{fmtInt(currentMeter)} hrs</span>
                        <span>·</span>
                        <Fuel className="h-2.5 w-2.5 text-black" />
                        <span className="font-normal text-black">{fuelPct}%</span>
                      </div>
                      <div className="text-[10px] font-normal text-black">
                        Rate: ₹{fmtInt(hourlyRate)}/hr
                      </div>
                    </div>
                  </div>

                  {/* Deployment Timeline & Driver Info */}
                  <div className="mt-2 space-y-1 text-[11px] font-normal text-black">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="flex items-center gap-1 text-black">
                        <Calendar className="h-3 w-3 text-black" />
                        <span>Since {d.start_date}</span>
                      </span>
                      <span className="text-black border border-zinc-200 rounded px-1.5 py-0.2 bg-white">
                        {d.end_date ? `Until ${d.end_date}` : 'Ongoing deployment'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-black">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3 text-black" />
                        <span>Operator: {opName}</span>
                      </span>
                      <span className="text-black">350m Geofenced</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-2.5 flex items-center justify-between border-t border-zinc-200 pt-2 text-[11px]">
                  <Link
                    href={`/machines/${d.machine_id}`}
                    className="inline-flex items-center gap-1 text-black hover:underline transition-colors"
                  >
                    <span>View Telemetry</span>
                    <ArrowRight className="h-3 w-3 text-black" />
                  </Link>

                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => router.push(`/deployments/${d.id}`)}
                      className="p-1 rounded text-black hover:bg-zinc-100 transition-colors"
                      title="Edit deployment"
                    >
                      <Pencil className="h-3 w-3 text-black" />
                    </button>
                    <button
                      onClick={() => void handleDelete(d.id, `${machineCode} @ ${siteName}`)}
                      className="p-1 rounded text-black hover:bg-zinc-100 transition-colors"
                      title="Delete deployment"
                    >
                      <Trash2 className="h-3 w-3 text-black" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Remove Machine Deployment"
        desc={`Are you sure you want to remove deployment for "${deleteTarget?.label}"? The machine will be marked as unassigned.`}
        confirmText="Confirm Remove"
        destructive
        isLoading={deleting}
        handleConfirm={() => { void confirmDeleteDeployment(); }}
      />
    </div>
  );
}
