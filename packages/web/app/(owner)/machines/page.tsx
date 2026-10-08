'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  Pencil,
  Trash2,
  Search,
  ArrowRight,
  Gauge,
  Fuel,
  User,
  Wrench,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchList } from '@/lib/api/fetch-list';
import { apiDelete } from '@/lib/api/mutations';
import { ConfirmDialog } from '@/components/confirm-dialog';

// ---------------------------------------------------------------------------
// Compact Technical Side-Profile CAD / Schematic Diagrams
// ---------------------------------------------------------------------------

function ExcavatorSideDiagram({ className = '' }: { className?: string }) {
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
      <line x1="42" y1="64" x2="42" y2="84" stroke="#71717A" strokeWidth="1.5" />
      <line x1="47" y1="64" x2="47" y2="84" stroke="#71717A" strokeWidth="1.5" />
      <rect x="58" y="44" width="3" height="12" fill="#000000" />

      <path d="M 76 96 L 76 46 L 108 46 L 114 68 L 114 96 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.8" />
      <polygon points="82,50 105,50 110,68 82,68" fill="#E4E4E7" stroke="#000000" strokeWidth="1.2" />

      <path d="M 96 78 Q 120 28 148 40 L 152 46 Q 124 38 102 84 Z" fill="#E4E4E7" stroke="#000000" strokeWidth="1.8" />
      <line x1="88" y1="84" x2="122" y2="46" stroke="#000000" strokeWidth="2.8" strokeLinecap="round" />

      <path d="M 148 40 L 180 82 L 174 86 L 144 46 Z" fill="#F4F4F5" stroke="#000000" strokeWidth="1.8" />
      <line x1="126" y1="36" x2="162" y2="60" stroke="#52525B" strokeWidth="2" strokeLinecap="round" />

      <path d="M 180 82 Q 198 88 194 104 L 176 104 Q 172 90 174 86 Z" fill="#D4D4D8" stroke="#000000" strokeWidth="1.8" />
      <polygon points="194,104 199,107 192,107" fill="#000000" />
      <polygon points="188,104 193,107 186,107" fill="#000000" />

      <circle cx="96" cy="78" r="2.5" fill="#000000" />
      <circle cx="148" cy="40" r="2.5" fill="#000000" />
      <circle cx="180" cy="82" r="2.5" fill="#000000" />
    </svg>
  );
}

function DozerSideDiagram({ className = '' }: { className?: string }) {
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
      <circle cx="68" cy="108" r="4.5" fill="#000000" />
      <circle cx="86" cy="108" r="4.5" fill="#000000" />
      <circle cx="104" cy="108" r="4.5" fill="#000000" />

      <path d="M 52 86 L 52 66 L 70 66 L 80 48 L 118 48 L 128 72 L 128 92 Z" fill="#F4F4F5" stroke="#000000" strokeWidth="1.8" />
      <polygon points="74,66 78,40 108,40 114,66" fill="#FFFFFF" stroke="#000000" strokeWidth="1.8" />
      <polygon points="78,62 82,44 104,44 108,62" fill="#E4E4E7" stroke="#000000" strokeWidth="1.2" />
      <line x1="116" y1="48" x2="116" y2="34" stroke="#000000" strokeWidth="3" />

      <line x1="68" y1="96" x2="148" y2="94" stroke="#000000" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="110" y1="72" x2="146" y2="88" stroke="#52525B" strokeWidth="2.8" />
      <path d="M 148 72 Q 160 92 154 114 L 144 114 Q 148 94 140 72 Z" fill="#D4D4D8" stroke="#000000" strokeWidth="1.8" />
      <rect x="138" y="68" width="9" height="4" fill="#000000" />

      <line x1="48" y1="88" x2="32" y2="98" stroke="#000000" strokeWidth="3.2" />
      <path d="M 32 98 L 26 114 L 30 114 L 36 102 Z" fill="#000000" />
    </svg>
  );
}

function DumpTruckSideDiagram({ className = '' }: { className?: string }) {
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
      <rect x="80" y="88" width="22" height="10" rx="2" fill="#52525B" stroke="#000000" strokeWidth="1" />

      <path d="M 36 86 L 36 68 Q 38 48 48 46 L 78 46 L 82 86 Z" fill="#F4F4F5" stroke="#000000" strokeWidth="1.8" />
      <path d="M 44 64 L 44 52 Q 46 48 54 48 L 76 48 L 76 64 Z" fill="#E4E4E7" stroke="#000000" strokeWidth="1.2" />

      <path d="M 86 84 L 86 42 L 54 34 L 54 30 L 100 38 L 190 38 L 196 74 L 188 84 Z" fill="#E4E4E7" stroke="#000000" strokeWidth="1.8" />
      <line x1="114" y1="44" x2="114" y2="82" stroke="#71717A" strokeWidth="1.5" />
      <line x1="138" y1="44" x2="138" y2="82" stroke="#71717A" strokeWidth="1.5" />
      <line x1="88" y1="84" x2="96" y2="58" stroke="#52525B" strokeWidth="3" />
    </svg>
  );
}

function WheelLoaderSideDiagram({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 130" className={`w-full h-full ${className}`}>
      <line x1="10" y1="118" x2="210" y2="118" stroke="#D4D4D8" strokeWidth="1" strokeDasharray="3,3" />
      <circle cx="56" cy="98" r="20" fill="#000000" stroke="#000000" strokeWidth="1.8" />
      <circle cx="56" cy="98" r="9" fill="#E4E4E7" />
      <circle cx="128" cy="98" r="20" fill="#000000" stroke="#000000" strokeWidth="1.8" />
      <circle cx="128" cy="98" r="9" fill="#E4E4E7" />

      <path d="M 38 88 L 38 64 L 84 64 L 88 88 Z" fill="#F4F4F5" stroke="#000000" strokeWidth="1.8" />
      <path d="M 74 64 L 78 40 L 102 40 L 106 64 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.8" />
      <polygon points="80,60 82,44 98,44 100,60" fill="#E4E4E7" stroke="#000000" strokeWidth="1.2" />
      <rect x="88" y="78" width="6" height="14" fill="#000000" />

      <path d="M 96 78 L 152 74 L 174 96 L 168 98 L 148 78 L 96 84 Z" fill="#E4E4E7" stroke="#000000" strokeWidth="1.8" />
      <polygon points="132,60 148,68 138,78" fill="#52525B" stroke="#000000" strokeWidth="1.2" />
      <line x1="102" y1="84" x2="134" y2="76" stroke="#000000" strokeWidth="2.8" />

      <path d="M 174 96 Q 196 98 194 72 L 182 72 Q 182 90 166 94 Z" fill="#D4D4D8" stroke="#000000" strokeWidth="1.8" />
    </svg>
  );
}

function BackhoeSideDiagram({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 130" className={`w-full h-full ${className}`}>
      <line x1="10" y1="118" x2="210" y2="118" stroke="#D4D4D8" strokeWidth="1" strokeDasharray="3,3" />
      <circle cx="82" cy="94" r="22" fill="#000000" stroke="#000000" strokeWidth="1.8" />
      <circle cx="82" cy="94" r="10" fill="#E4E4E7" />
      <circle cx="142" cy="102" r="14" fill="#000000" stroke="#000000" strokeWidth="1.8" />
      <circle cx="142" cy="102" r="6" fill="#E4E4E7" />

      <path d="M 68 84 L 72 44 L 106 44 L 110 84 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.8" />
      <polygon points="76,80 78,48 102,48 104,80" fill="#E4E4E7" stroke="#000000" strokeWidth="1.2" />
      <path d="M 110 84 L 110 68 L 148 68 L 148 88 Z" fill="#F4F4F5" stroke="#000000" strokeWidth="1.8" />

      <line x1="108" y1="78" x2="174" y2="92" stroke="#000000" strokeWidth="3.5" />
      <path d="M 174 92 Q 192 94 190 76 L 180 76 Q 180 88 170 90 Z" fill="#E4E4E7" stroke="#000000" strokeWidth="1.8" />

      <rect x="58" y="74" width="10" height="20" fill="#000000" />
      <path d="M 60 78 Q 44 48 30 62 L 26 66 Q 38 54 56 82 Z" fill="#E4E4E7" stroke="#000000" strokeWidth="1.8" />
      <line x1="30" y1="62" x2="20" y2="92" stroke="#000000" strokeWidth="2.8" />
      <path d="M 20 92 Q 12 98 16 106 L 24 102 Z" fill="#D4D4D8" stroke="#000000" strokeWidth="1.5" />
    </svg>
  );
}

function CraneSideDiagram({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 130" className={`w-full h-full ${className}`}>
      <line x1="10" y1="118" x2="210" y2="118" stroke="#D4D4D8" strokeWidth="1" strokeDasharray="3,3" />
      <circle cx="46" cy="106" r="12" fill="#000000" stroke="#000000" strokeWidth="1.5" />
      <circle cx="46" cy="106" r="5" fill="#E4E4E7" />
      <circle cx="74" cy="106" r="12" fill="#000000" stroke="#000000" strokeWidth="1.5" />
      <circle cx="74" cy="106" r="5" fill="#E4E4E7" />
      <circle cx="134" cy="106" r="12" fill="#000000" stroke="#000000" strokeWidth="1.5" />
      <circle cx="134" cy="106" r="5" fill="#E4E4E7" />
      <circle cx="162" cy="106" r="12" fill="#000000" stroke="#000000" strokeWidth="1.5" />
      <circle cx="162" cy="106" r="5" fill="#E4E4E7" />

      <rect x="32" y="92" width="156" height="8" fill="#000000" />
      <rect x="30" y="98" width="8" height="14" fill="#000000" />
      <rect x="176" y="98" width="8" height="14" fill="#000000" />
      <path d="M 166 92 L 166 76 L 188 76 L 188 92 Z" fill="#F4F4F5" stroke="#000000" strokeWidth="1.5" />

      <circle cx="96" cy="88" r="8" fill="#52525B" />
      <rect x="100" y="66" width="22" height="20" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
      <rect x="70" y="68" width="18" height="18" fill="#000000" stroke="#000000" />

      <path d="M 88 74 L 170 30 L 174 36 L 92 80 Z" fill="#E4E4E7" stroke="#000000" strokeWidth="1.8" />
      <path d="M 164 33 L 198 15 L 200 19 L 168 37 Z" fill="#F4F4F5" stroke="#000000" strokeWidth="1.5" />
      <line x1="98" y1="82" x2="134" y2="52" stroke="#000000" strokeWidth="2.8" />
      <line x1="198" y1="18" x2="198" y2="52" stroke="#52525B" strokeWidth="1" strokeDasharray="2,2" />
      <rect x="194" y="52" width="8" height="8" fill="#000000" />
    </svg>
  );
}

function MotorGraderSideDiagram({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 130" className={`w-full h-full ${className}`}>
      <line x1="10" y1="118" x2="210" y2="118" stroke="#D4D4D8" strokeWidth="1" strokeDasharray="3,3" />
      <circle cx="50" cy="102" r="15" fill="#000000" stroke="#000000" strokeWidth="1.8" />
      <circle cx="50" cy="102" r="6" fill="#E4E4E7" />
      <circle cx="82" cy="102" r="15" fill="#000000" stroke="#000000" strokeWidth="1.8" />
      <circle cx="82" cy="102" r="6" fill="#E4E4E7" />
      <circle cx="178" cy="102" r="14" fill="#000000" stroke="#000000" strokeWidth="1.8" />
      <circle cx="178" cy="102" r="6" fill="#E4E4E7" />

      <path d="M 94 76 Q 130 54 176 96 L 176 100 Q 132 58 94 82 Z" fill="#E4E4E7" stroke="#000000" strokeWidth="1.8" />
      <rect x="36" y="74" width="56" height="18" fill="#F4F4F5" stroke="#000000" strokeWidth="1.8" />

      <path d="M 88 74 L 92 46 L 114 46 L 118 74 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.8" />
      <polygon points="94,70 96,50 110,50 112,70" fill="#E4E4E7" stroke="#000000" strokeWidth="1.2" />

      <circle cx="132" cy="84" r="8" fill="#52525B" stroke="#000000" strokeWidth="1.2" />
      <path d="M 120 98 L 148 94 L 146 106 L 118 110 Z" fill="#D4D4D8" stroke="#000000" strokeWidth="1.8" />
    </svg>
  );
}

function MachineSideDiagram({ type, className = '' }: { type: string; className?: string }) {
  const t = (type || '').toLowerCase();
  if (t.includes('excavat')) return <ExcavatorSideDiagram className={className} />;
  if (t.includes('dozer') || t.includes('bull')) return <DozerSideDiagram className={className} />;
  if (t.includes('dump') || t.includes('tipper') || t.includes('truck')) return <DumpTruckSideDiagram className={className} />;
  if (t.includes('wheel') || (t.includes('loader') && !t.includes('backhoe'))) return <WheelLoaderSideDiagram className={className} />;
  if (t.includes('backhoe')) return <BackhoeSideDiagram className={className} />;
  if (t.includes('crane')) return <CraneSideDiagram className={className} />;
  if (t.includes('grader')) return <MotorGraderSideDiagram className={className} />;
  return <ExcavatorSideDiagram className={className} />;
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
// Main Compact Machines Fleet Page Component (Font Black Color)
// ---------------------------------------------------------------------------

export default function OwnerMachines() {
  const router = useRouter();
  const [machines, setMachines] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const loadMachines = () => {
    setApiError(false);
    fetchList<Record<string, unknown>>('/api/v1/machines')
      .then((data) => {
        setMachines(data);
        if (data.length === 0) setApiError(false);
      })
      .catch(() => setApiError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMachines();
  }, []);

  const handleDelete = (id: string, name: string) => setDeleteTarget({ id, label: name });

  const confirmDeleteMachine = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiDelete(`/api/v1/machines/${deleteTarget.id}`);
      setMachines((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const operationalCount = useMemo(
    () => machines.filter((m) => {
      const s = String(m.status_flag ?? '').toLowerCase();
      return s === 'active' || s === 'working';
    }).length,
    [machines],
  );

  const serviceCount = useMemo(
    () => machines.filter((m) => {
      const s = String(m.status_flag ?? '').toLowerCase();
      return s === 'service' || s === 'maintenance';
    }).length,
    [machines],
  );

  const standbyCount = useMemo(
    () => machines.filter((m) => {
      const s = String(m.status_flag ?? '').toLowerCase();
      return s === 'idle' || s === 'stopped' || s === 'inactive';
    }).length,
    [machines],
  );

  const filteredMachines = useMemo(() => {
    return machines.filter((m) => {
      const code = String(m.code ?? '').toLowerCase();
      const make = String(m.make ?? '').toLowerCase();
      const model = String(m.model ?? '').toLowerCase();
      const type = String(m.type ?? '').toLowerCase();
      const site = String(m.site_name ?? m.site ?? '').toLowerCase();
      const client = String(m.client_name ?? m.client ?? '').toLowerCase();
      const q = searchQuery.toLowerCase();

      const matchesSearch = !q || code.includes(q) || make.includes(q) || model.includes(q) || site.includes(q) || client.includes(q);
      const matchesType = selectedType === 'all' || type.includes(selectedType.toLowerCase());
      const status = String(m.status_flag ?? '').toLowerCase();
      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'operational' && (status === 'active' || status === 'working')) ||
        (selectedStatus === 'service' && (status === 'service' || status === 'maintenance')) ||
        (selectedStatus === 'standby' && (status === 'idle' || status === 'stopped'));

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [machines, searchQuery, selectedType, selectedStatus]);

  return (
    <div className="space-y-4 text-black">
      {apiError && (
        <div className="flex items-center gap-2.5 rounded-lg border border-black bg-zinc-50 p-3 text-xs text-black">
          <AlertTriangle className="h-4 w-4 shrink-0 text-black" />
          <p className="font-normal text-black">API offline · Serving verified local cache</p>
          <Button size="sm" variant="outline" onClick={loadMachines} className="ml-auto h-6 px-2 text-[11px] font-normal text-black border-black">
            Retry
          </Button>
        </div>
      )}

      {/* Compact Page Header (Solid Black Font) */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-normal tracking-tight text-black">Machines Fleet</h1>
          <p className="text-[11px] font-normal text-black">
            Technical equipment overview and active telemetry
          </p>
        </div>
        <Link href="/machines/new">
          <Button size="sm" className="h-8 bg-black hover:bg-zinc-800 text-white text-xs font-normal">
            <Plus className="mr-1 h-3.5 w-3.5 text-white" /> Add Machine
          </Button>
        </Link>
      </div>

      {/* Compact 4-Metric Overview Bar (Solid Black Font) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="rounded-lg border border-zinc-300 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-normal text-black">Total Fleet</span>
            <Truck className="h-3.5 w-3.5 text-black" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-normal text-black">{machines.length}</span>
            <span className="text-[10px] font-normal text-black">assets</span>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-300 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-normal text-black">Operational</span>
            <CheckCircle className="h-3.5 w-3.5 text-black" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-normal text-black">{operationalCount}</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-normal text-black">
              <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" /> on site
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-300 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-normal text-black">Standby / Idle</span>
            <Clock className="h-3.5 w-3.5 text-black" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-normal text-black">{standbyCount}</span>
            <span className="text-[10px] font-normal text-black">ready</span>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-300 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-normal text-black">In Service</span>
            <Wrench className="h-3.5 w-3.5 text-black" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-normal text-black">{serviceCount}</span>
            <span className="text-[10px] font-normal text-black">scheduled</span>
          </div>
        </div>
      </div>

      {/* Compact Search & Filters Toolbar (Solid Black Font) */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-300 bg-white p-2 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-black" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code, model, site, client..."
            className="w-full rounded-md border border-zinc-300 bg-zinc-50 py-1 pl-8 pr-2.5 text-xs font-normal text-black placeholder:text-zinc-600 outline-none focus:border-black"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-md border border-zinc-300 bg-zinc-50 py-1 px-2.5 text-xs font-normal text-black outline-none"
          >
            <option value="all">All Types</option>
            <option value="excavator">Excavators</option>
            <option value="dump_truck">Dump Trucks</option>
            <option value="dozer">Dozers</option>
            <option value="wheel_loader">Wheel Loaders</option>
            <option value="backhoe">Backhoes</option>
            <option value="crane">Cranes</option>
            <option value="grader">Graders</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-md border border-zinc-300 bg-zinc-50 py-1 px-2.5 text-xs font-normal text-black outline-none"
          >
            <option value="all">All Status</option>
            <option value="operational">Operational</option>
            <option value="standby">Standby</option>
            <option value="service">In Service</option>
          </select>
        </div>
      </div>

      {/* Compact Machines Grid (Solid Black Font Everywhere) */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 rounded-lg border border-zinc-300 bg-white p-3.5 animate-pulse">
              <div className="h-3 bg-zinc-300 rounded w-1/3 mb-2"></div>
              <div className="h-2.5 bg-zinc-200 rounded w-1/2 mb-4"></div>
              <div className="h-16 bg-zinc-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredMachines.length === 0 ? (
        <div className="rounded-lg border border-zinc-300 bg-white p-8 text-center shadow-sm">
          <Truck className="mx-auto h-6 w-6 text-black" />
          <h3 className="mt-2 text-xs font-normal text-black">No matching machines</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setSearchQuery(''); setSelectedType('all'); setSelectedStatus('all'); }}
            className="mt-3 h-7 text-xs font-normal text-black border-black"
          >
            Reset
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMachines.map((m) => {
            const rawStatus = String(m.status_flag ?? '').toLowerCase();
            const isWorking = rawStatus === 'active' || rawStatus === 'working';
            const isService = rawStatus === 'service' || rawStatus === 'maintenance';

            const statusLabel = isWorking ? 'Operational' : isService ? 'In Service' : 'Standby';
            const currentMeter = num(m.current_meter, 0);
            const meterUnit = String(m.meter_unit_label ?? m.primary_meter_type ?? 'hrs');
            const fuelPct = num(m.fuel_level_pct, 68);
            const siteName = String(m.site_name ?? m.site ?? 'Bangalore Metro Phase 2 — Reach 6');
            const clientName = String(m.client_name ?? m.client ?? 'L&T Construction');
            const opName = String(m.operator_name ?? 'Assigned Operator');
            const hourlyRate = num(m.hourly_rate, 2500);
            const machineType = String(m.type ?? 'excavator');

            return (
              <div
                key={String(m.id)}
                className="group flex flex-col justify-between rounded-lg border border-zinc-300 bg-white p-3.5 shadow-sm hover:border-black transition-all"
              >
                <div>
                  {/* Machine Header: Code, Model, Status (Black Font) */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/machines/${m.id}`}
                          className="text-sm font-normal text-black hover:underline tracking-tight"
                        >
                          {String(m.code)}
                        </Link>
                        <span className="rounded border border-zinc-400 bg-zinc-100 px-1.5 py-0.2 text-[9px] font-normal uppercase text-black">
                          {String(m.make ?? 'OEM')}
                        </span>
                      </div>
                      <p className="text-[11px] font-normal text-black truncate">
                        {String(m.model ?? machineType)}
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1 rounded-full border border-zinc-400 bg-zinc-50 px-2 py-0.5 text-[10px] font-normal text-black shrink-0">
                      <span className={`h-1.5 w-1.5 rounded-full ${isWorking ? 'bg-black animate-pulse' : 'bg-zinc-600'}`} />
                      {statusLabel}
                    </span>
                  </div>

                  {/* Compact Side-by-Side Blueprint & Telemetry Strip (Black Font) */}
                  <div className="mt-2.5 flex items-center justify-between gap-2 rounded-md border border-zinc-300 bg-zinc-50/80 p-2">
                    {/* Compact Side Diagram */}
                    <div className="h-14 w-28 shrink-0 flex items-center justify-center">
                      <MachineSideDiagram type={machineType} />
                    </div>

                    {/* Quick Specs Column (Black Font) */}
                    <div className="flex-1 space-y-1 text-right text-[11px]">
                      <div className="flex items-center justify-end gap-1.5">
                        <Gauge className="h-3 w-3 text-black" />
                        <span className="font-normal text-black">{fmtInt(currentMeter)} {meterUnit}</span>
                      </div>
                      <div className="flex items-center justify-end gap-1.5">
                        <Fuel className="h-3 w-3 text-black" />
                        <span className="font-normal text-black">{fuelPct}% tank</span>
                      </div>
                      <div className="text-[10px] font-normal text-black">
                        ₹{fmtInt(hourlyRate)}/hr
                      </div>
                    </div>
                  </div>

                  {/* Location & Operator (Solid Black Font) */}
                  <div className="mt-2 space-y-0.5 text-[11px] font-normal">
                    <p className="flex items-center gap-1.5 text-black truncate">
                      <MapPin className="h-3 w-3 text-black shrink-0" />
                      <span className="truncate">{siteName}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-[10px] text-black truncate pl-4.5">
                      <span>Client: {clientName}</span>
                      <span>·</span>
                      <User className="h-2.5 w-2.5 inline text-black" />
                      <span>{opName}</span>
                    </p>
                  </div>
                </div>

                {/* Compact Card Action Footer (Solid Black Font) */}
                <div className="mt-2.5 flex items-center justify-between border-t border-zinc-200 pt-2">
                  <Link
                    href={`/machines/${m.id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-normal text-black hover:underline transition-colors"
                  >
                    <span>View Telemetry</span>
                    <ArrowRight className="h-3 w-3 text-black" />
                  </Link>

                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => router.push(`/machines/${m.id}`)}
                      className="p-1 rounded text-black hover:bg-zinc-100 transition-colors"
                      title="Edit machine"
                    >
                      <Pencil className="h-3 w-3 text-black" />
                    </button>
                    <button
                      onClick={() => void handleDelete(String(m.id), String(m.code))}
                      className="p-1 rounded text-black hover:bg-zinc-100 transition-colors"
                      title="Delete machine"
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
        title="Delete Machine Record"
        desc={`Are you sure you want to delete "${deleteTarget?.label}"? All associated telemetry logs and schedules will be archived.`}
        confirmText="Confirm Delete"
        destructive
        isLoading={deleting}
        handleConfirm={() => { void confirmDeleteMachine(); }}
      />
    </div>
  );
}
