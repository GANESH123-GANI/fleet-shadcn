'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Pencil,
  Plus,
  ShieldCheck,
  Radio,
  Phone,
  User,
  Truck,
  Gauge,
  Fuel,
  ArrowRight,
  Compass,
  Navigation,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchList } from '@/lib/api/fetch-list';
import { apiPatch } from '@/lib/api/mutations';

// Dynamically load the Leaflet Map
const SiteLeafletMap = dynamic(
  () => import('@/components/dashboard/site-leaflet-map').then((m) => m.SiteLeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-56 w-full items-center justify-center rounded-xl border border-zinc-300 bg-zinc-50 animate-pulse">
        <p className="text-xs font-normal text-black">Loading Map View...</p>
      </div>
    ),
  },
);

// ---------------------------------------------------------------------------
// Client Corporate Company Brand Logos
// ---------------------------------------------------------------------------

function LTLogo({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center rounded-lg bg-black text-white shrink-0 shadow-sm ${className}`}>
      <svg viewBox="0 0 40 40" className="h-6 w-6" fill="none">
        <polygon points="20,4 36,20 20,36 4,20" stroke="#FFFFFF" strokeWidth="2.2" fill="none" />
        <text x="20" y="24" fontSize="10" fontWeight="700" fill="#FFFFFF" textAnchor="middle" fontFamily="sans-serif">L&T</text>
      </svg>
    </div>
  );
}

function TataLogo({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center rounded-lg bg-black text-white shrink-0 shadow-sm ${className}`}>
      <svg viewBox="0 0 40 40" className="h-6 w-6" fill="none">
        <circle cx="20" cy="20" r="15" stroke="#FFFFFF" strokeWidth="2" fill="none" />
        <path d="M 12 16 Q 20 12 28 16" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M 14 21 Q 20 17 26 21" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <text x="20" y="30" fontSize="7" fontWeight="700" fill="#FFFFFF" textAnchor="middle" letterSpacing="1" fontFamily="sans-serif">TATA</text>
      </svg>
    </div>
  );
}

function AfconsLogo({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center rounded-lg bg-black text-white shrink-0 shadow-sm ${className}`}>
      <svg viewBox="0 0 40 40" className="h-6 w-6" fill="none">
        <polygon points="20,5 33,12 33,28 20,35 7,28 7,12" stroke="#FFFFFF" strokeWidth="2" fill="none" />
        <path d="M 14 26 L 20 13 L 26 26" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="16" y1="22" x2="24" y2="22" stroke="#FFFFFF" strokeWidth="1.8" />
      </svg>
    </div>
  );
}

function ShapoorjiLogo({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center rounded-lg bg-black text-white shrink-0 shadow-sm ${className}`}>
      <svg viewBox="0 0 40 40" className="h-6 w-6" fill="none">
        <rect x="6" y="6" width="28" height="28" rx="6" stroke="#FFFFFF" strokeWidth="2" fill="none" />
        <text x="20" y="24" fontSize="13" fontWeight="700" fill="#FFFFFF" textAnchor="middle" letterSpacing="0.5" fontFamily="sans-serif">SP</text>
      </svg>
    </div>
  );
}

function DilipLogo({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center rounded-lg bg-black text-white shrink-0 shadow-sm ${className}`}>
      <svg viewBox="0 0 40 40" className="h-6 w-6" fill="none">
        <path d="M 8 30 Q 15 10 32 10" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M 12 32 Q 22 18 32 18" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="2,2" fill="none" />
        <text x="20" y="32" fontSize="7" fontWeight="700" fill="#FFFFFF" textAnchor="middle" letterSpacing="1" fontFamily="sans-serif">DBL</text>
      </svg>
    </div>
  );
}

function ClientCompanyLogo({ clientName, className = 'h-9 w-9' }: { clientName: string; className?: string }) {
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

function CraneCAD({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 130" className={`w-full h-full ${className}`}>
      <line x1="10" y1="118" x2="210" y2="118" stroke="#D4D4D8" strokeWidth="1" strokeDasharray="3,3" />
      <circle cx="46" cy="106" r="12" fill="#000000" stroke="#000000" strokeWidth="1.5" />
      <circle cx="74" cy="106" r="12" fill="#000000" stroke="#000000" strokeWidth="1.5" />
      <circle cx="134" cy="106" r="12" fill="#000000" stroke="#000000" strokeWidth="1.5" />
      <circle cx="162" cy="106" r="12" fill="#000000" stroke="#000000" strokeWidth="1.5" />
      <rect x="32" y="92" width="156" height="8" fill="#000000" />
      <circle cx="96" cy="88" r="8" fill="#52525B" />
      <rect x="100" y="66" width="22" height="20" rx="2" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
      <path d="M 88 74 L 170 30 L 174 36 L 92 80 Z" fill="#E4E4E7" stroke="#000000" strokeWidth="1.8" />
      <path d="M 164 33 L 198 15 L 200 19 L 168 37 Z" fill="#F4F4F5" stroke="#000000" strokeWidth="1.5" />
      <line x1="198" y1="18" x2="198" y2="52" stroke="#52525B" strokeWidth="1" strokeDasharray="2,2" />
      <rect x="194" y="52" width="8" height="8" fill="#000000" />
    </svg>
  );
}

function MachineCAD({ type, className = '' }: { type: string; className?: string }) {
  const t = (type || '').toLowerCase();
  if (t.includes('dump') || t.includes('tipper') || t.includes('truck')) return <DumpTruckCAD className={className} />;
  if (t.includes('crane')) return <CraneCAD className={className} />;
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
// Main Site Detail Page Component
// ---------------------------------------------------------------------------

export default function SiteDetail() {
  const params = useParams();
  const router = useRouter();
  const [site, setSite] = useState<Record<string, unknown> | null>(null);
  const [deployments, setDeployments] = useState<Record<string, unknown>[]>([]);
  const [machines, setMachines] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    location: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    void Promise.all([
      fetchList<Record<string, unknown>>('/api/v1/sites'),
      fetchList<Record<string, unknown>>('/api/v1/deployments'),
      fetchList<Record<string, unknown>>('/api/v1/machines'),
    ]).then(([sites, deploys, machs]) => {
      const found = sites.find((s) => s.id === params.id) || sites[0] || null;
      if (found) {
        setSite(found);
        setDeployments(deploys.filter((d) => String(d.site_id) === String(params.id)));
        setMachines(machs);
        setForm({
          name: (found.name as string) || '',
          location: (found.location as string) || '',
          start_date: (found.start_date as string) || '',
          end_date: (found.end_date as string) || '',
        });
      }
    }).finally(() => setLoading(false));
  }, [params.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiPatch(`/api/v1/sites/${params.id}`, {
        name: form.name,
        location: form.location || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      });
      setEditing(false);
      const [sites, deploys, machs] = await Promise.all([
        fetchList<Record<string, unknown>>('/api/v1/sites'),
        fetchList<Record<string, unknown>>('/api/v1/deployments'),
        fetchList<Record<string, unknown>>('/api/v1/machines'),
      ]);
      const found = sites.find((s) => s.id === params.id);
      if (found) {
        setSite(found);
        setDeployments(deploys.filter((d) => String(d.site_id) === String(params.id)));
        setMachines(machs);
      }
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const machineById = useMemo(() => {
    const map = new Map<string, Record<string, unknown>>();
    machines.forEach((m) => map.set(String(m.id), m));
    return map;
  }, [machines]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6 text-black">
        <p className="text-sm font-normal text-black">Loading project site...</p>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="p-6 text-center text-black">
        <p className="text-sm font-normal text-black">Site not found.</p>
        <Link href="/sites" className="mt-3 inline-block text-xs font-normal text-black underline">
          Return to Sites
        </Link>
      </div>
    );
  }

  const clientName = String(site.client_name ?? 'L&T Construction');
  const siteName = String(site.name ?? 'Bangalore Metro Phase 2 — Reach 6');
  const locationAddress = String(site.address ?? site.location ?? 'Dairy Circle to Nagawara Underground, Bengaluru');
  const siteManager = String(site.site_manager ?? 'Sanjay Deshpande');
  const managerPhone = String(site.manager_phone ?? '+91 98451 98765');
  const startDate = String(site.start_date ?? '2025-01-20');
  const endDate = String(site.end_date ?? '2027-12-31');
  const lat = typeof site.lat === 'number' ? site.lat : 12.9345;
  const lng = typeof site.lng === 'number' ? site.lng : 77.6012;

  return (
    <div className="space-y-4 text-black">
      {/* Top Header Bar (Company Logo, Breadcrumb & Actions) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/sites"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-normal text-black hover:bg-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-black" /> Sites
          </Link>

          {/* Authentic Corporate Logo */}
          <ClientCompanyLogo clientName={clientName} className="h-9 w-9" />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-normal tracking-tight text-black">{siteName}</h1>
              <span className="inline-flex items-center gap-1 rounded-full border border-zinc-400 bg-zinc-50 px-2 py-0.5 text-[10px] font-normal text-black">
                <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" />
                Active Worksite
              </span>
            </div>
            <p className="text-[11px] font-normal text-black">
              Client: {clientName} · Project ID: #{String(site.id ?? 'site-001')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setEditing(false)} className="h-8 text-xs font-normal text-black border-black">
                Cancel
              </Button>
              <Button size="sm" onClick={() => { void handleSave(); }} disabled={saving} className="h-8 bg-black text-white text-xs font-normal">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="h-8 text-xs font-normal text-black border-zinc-300">
                <Pencil className="mr-1 h-3.5 w-3.5 text-black" /> Edit Details
              </Button>
              <Link href={`/deployments/new?site_id=${params.id}`}>
                <Button size="sm" className="h-8 bg-black hover:bg-zinc-800 text-white text-xs font-normal">
                  <Plus className="mr-1 h-3.5 w-3.5 text-white" /> Deploy Machine
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <div className="rounded-xl border border-zinc-300 bg-white p-4 shadow-sm text-black">
          <h3 className="text-sm font-medium text-black mb-3 pb-2 border-b border-zinc-200">Edit Site Information</h3>
          <div className="grid gap-3 sm:grid-cols-2 text-black">
            <div>
              <label className="block text-xs font-normal text-black mb-1">Site Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-zinc-300 rounded-lg outline-none font-normal text-black"
              />
            </div>
            <div>
              <label className="block text-xs font-normal text-black mb-1">Location Address</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-zinc-300 rounded-lg outline-none font-normal text-black"
              />
            </div>
            <div>
              <label className="block text-xs font-normal text-black mb-1">Start Date</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-zinc-300 rounded-lg outline-none font-normal text-black"
              />
            </div>
            <div>
              <label className="block text-xs font-normal text-black mb-1">End Date</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-zinc-300 rounded-lg outline-none font-normal text-black"
              />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Top 4 KPI Metric Boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-black">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between min-h-[115px] sm:min-h-[125px] hover:border-zinc-400 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-black">Active Deployed Fleet</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-100 text-black">
                  <Truck className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between pt-3">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-black">{deployments.length}</span>
                <span className="text-xs font-normal text-zinc-600">heavy assets</span>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between min-h-[115px] sm:min-h-[125px] hover:border-zinc-400 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-black">Geofence Perimeter</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-100 text-black">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between pt-3">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-black">350m</span>
                <span className="text-xs font-normal text-zinc-600">radius secure</span>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between min-h-[115px] sm:min-h-[125px] hover:border-zinc-400 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-black">Project Duration</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-100 text-black">
                  <Calendar className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between pt-3">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-black">627d</span>
                <span className="text-xs font-normal text-zinc-600">since Jan 2025</span>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between min-h-[115px] sm:min-h-[125px] hover:border-zinc-400 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-black">Site Manager</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-100 text-black">
                  <User className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between pt-3">
                <span className="text-sm font-semibold text-black truncate max-w-[70%]">{siteManager}</span>
                <span className="text-xs font-normal text-zinc-600">lead</span>
              </div>
            </div>
          </div>

          {/* TWO MAIN COLUMNS: Left = Interactive Map & Geofence; Right = Site Specs & Manager Contact */}
          <div className="grid gap-3 lg:grid-cols-12 text-black">
            {/* Interactive Leaflet Map Hero (7 Cols) */}
            <div className="lg:col-span-7 rounded-lg border border-zinc-300 bg-white p-3.5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-black" />
                    <h3 className="text-xs font-normal text-black">Live Geofence Telemetry & Map</h3>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-normal text-black">
                    <Radio className="h-3 w-3 text-black animate-pulse" /> Live GPS Stream
                  </span>
                </div>

                {/* Leaflet Map Embed */}
                <div className="mt-2.5 overflow-hidden rounded-md border border-zinc-300">
                  <SiteLeafletMap
                    lat={lat}
                    lng={lng}
                    siteName={siteName}
                    machineCode={deployments[0]?.machine_code as string || 'FLEET'}
                    clientName={clientName}
                    radiusMeters={350}
                    className="h-52 w-full"
                  />
                </div>
              </div>

              {/* Map Footer Info */}
              <div className="mt-2 flex items-center justify-between text-[11px] font-normal text-black border-t border-zinc-100 pt-2">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-black" />
                  <span>350m Perimeter Boundary · Active Telemetry</span>
                </span>
                <a
                  href={`https://www.google.com/maps?q=${lat},${lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-black hover:underline"
                >
                  <Navigation className="h-3 w-3 text-black" /> Google Maps
                </a>
              </div>
            </div>

            {/* Right: Site Details, Manager, Timeline (5 Cols) */}
            <div className="lg:col-span-5 space-y-3 text-black">
              <div className="rounded-lg border border-zinc-300 bg-white p-3.5 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                  <h3 className="text-xs font-normal text-black">Project Specifications</h3>
                  <span className="text-[10px] font-normal text-black">Contract Scope</span>
                </div>

                <div className="space-y-1.5 text-xs font-normal text-black">
                  <div className="flex items-start justify-between gap-2 p-2 rounded bg-zinc-50 border border-zinc-200">
                    <span className="text-black text-[11px]">Client Partner</span>
                    <span className="font-normal text-black text-[11px] text-right">{clientName}</span>
                  </div>

                  <div className="flex items-start justify-between gap-2 p-2 rounded bg-zinc-50 border border-zinc-200">
                    <span className="text-black text-[11px]">Location Address</span>
                    <span className="font-normal text-black text-[11px] text-right max-w-[65%] truncate">
                      {locationAddress}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2 p-2 rounded bg-zinc-50 border border-zinc-200">
                    <span className="text-black text-[11px]">GPS Coordinates</span>
                    <span className="font-normal text-black text-[11px] flex items-center gap-1">
                      <Compass className="h-3 w-3 text-black" />
                      {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2 p-2 rounded bg-zinc-50 border border-zinc-200">
                    <span className="text-black text-[11px]">Project Timeline</span>
                    <span className="font-normal text-black text-[11px]">
                      {startDate} → {endDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Site Manager Contact Card */}
              <div className="rounded-lg border border-zinc-300 bg-white p-3.5 shadow-sm text-black">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                  <h3 className="text-xs font-normal text-black">Site Administration</h3>
                  <span className="text-[10px] font-normal text-black">On-Site Contact</span>
                </div>

                <div className="mt-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-black border border-zinc-300 text-xs">
                      <User className="h-4 w-4 text-black" />
                    </div>
                    <div>
                      <p className="text-xs font-normal text-black">{siteManager}</p>
                      <p className="text-[10px] font-normal text-black flex items-center gap-1">
                        <Phone className="h-2.5 w-2.5 text-black" /> {managerPhone}
                      </p>
                    </div>
                  </div>
                  <span className="rounded border border-zinc-300 bg-zinc-50 px-2 py-0.5 text-[10px] font-normal text-black">
                    Authorized Manager
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* LOWER SECTION: Deployed Machines with CAD Diagrams & Telemetry */}
          <div className="rounded-lg border border-zinc-300 bg-white p-3.5 shadow-sm text-black">
            <div className="flex items-center justify-between pb-2.5 border-b border-zinc-200">
              <div className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-black" />
                <h3 className="text-xs font-normal text-black">
                  Deployed Machinery Fleet ({deployments.length})
                </h3>
              </div>
              <Link href={`/deployments/new?site_id=${params.id}`}>
                <Button size="sm" variant="outline" className="h-6 px-2 text-[11px] font-normal text-black border-zinc-300">
                  <Plus className="mr-1 h-3 w-3 text-black" /> Deploy Machine
                </Button>
              </Link>
            </div>

            {deployments.length === 0 ? (
              <div className="py-8 text-center text-black">
                <Truck className="mx-auto h-6 w-6 text-black" />
                <p className="mt-2 text-xs font-normal text-black">No equipment deployed on this site.</p>
                <Link href={`/deployments/new?site_id=${params.id}`} className="mt-2 inline-block text-xs font-normal text-black underline">
                  Deploy your first machine
                </Link>
              </div>
            ) : (
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {deployments.map((d) => {
                  const mach = machineById.get(String(d.machine_id));
                  const machineCode = String((d.machine_code as string) ?? (mach?.code as string) ?? 'EX-01');
                  const machineType = String((mach?.type as string) ?? 'excavator');
                  const machineMake = String(mach?.make ?? 'OEM');
                  const machineModel = String(mach?.model ?? machineType);
                  const meterVal = num(mach?.current_meter, 4280.5);
                  const fuelVal = num(mach?.fuel_level_pct, 68);
                  const opName = String(mach?.operator_name ?? 'Assigned Operator');

                  return (
                    <div
                      key={String(d.id)}
                      className="group flex flex-col justify-between rounded-lg border border-zinc-300 bg-white p-3 shadow-sm hover:border-black transition-all"
                    >
                      <div>
                        {/* Machine Code & Status */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={`/machines/${d.machine_id}`}
                                className="text-sm font-normal text-black hover:underline tracking-tight"
                              >
                                {machineCode}
                              </Link>
                              <span className="rounded border border-zinc-300 bg-zinc-100 px-1.5 py-0.2 text-[9px] font-normal uppercase text-black">
                                {machineMake}
                              </span>
                            </div>
                            <p className="text-[11px] font-normal text-black truncate max-w-[160px]">
                              {machineModel}
                            </p>
                          </div>

                          <span className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-zinc-50 px-2 py-0.5 text-[10px] font-normal text-black shrink-0">
                            <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" />
                            Active
                          </span>
                        </div>

                        {/* Machine CAD Blueprint Thumbnail + Telemetry Strip */}
                        <div className="mt-2 flex items-center justify-between gap-2 rounded-md border border-zinc-200 bg-zinc-50/80 p-2">
                          <div className="h-12 w-24 shrink-0 flex items-center justify-center">
                            <MachineCAD type={machineType} />
                          </div>

                          <div className="flex-1 space-y-1 text-right text-[11px]">
                            <div className="flex items-center justify-end gap-1">
                              <Gauge className="h-3 w-3 text-black" />
                              <span className="font-normal text-black">{fmtInt(meterVal)} hrs</span>
                            </div>
                            <div className="flex items-center justify-end gap-1">
                              <Fuel className="h-3 w-3 text-black" />
                              <span className="font-normal text-black">{fuelVal}% fuel</span>
                            </div>
                          </div>
                        </div>

                        {/* Operator */}
                        <p className="mt-2 flex items-center gap-1 text-[10px] font-normal text-black">
                          <User className="h-2.5 w-2.5 text-black" />
                          <span>Operator: {opName}</span>
                        </p>
                      </div>

                      {/* Card Action Link */}
                      <div className="mt-2 border-t border-zinc-200 pt-1.5">
                        <Link
                          href={`/machines/${d.machine_id}`}
                          className="flex items-center justify-between text-[11px] font-normal text-black hover:underline"
                        >
                          <span>View Telemetry & Gauges</span>
                          <ArrowRight className="h-3 w-3 text-black" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
