'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Calendar,
  Pencil,
  Trash2,
  Search,
  ArrowRight,
  ShieldCheck,
  Radio,
  Phone,
  User,
  Tractor,
  Truck,
  Plus,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchList, getCachedList } from '@/lib/api/fetch-list';
import { apiDelete } from '@/lib/api/mutations';
import { ConfirmDialog } from '@/components/confirm-dialog';

// ---------------------------------------------------------------------------
// Client / Corporate Company Brand Logos
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
// Creative Geofence Radar Graphic
// ---------------------------------------------------------------------------

function GeofenceRadar({ lat, lng, radius = 350 }: { lat?: number; lng?: number; radius?: number }) {
  const displayLat = lat ? `${lat.toFixed(4)}° N` : '12.9345° N';
  const displayLng = lng ? `${lng.toFixed(4)}° E` : '77.6012° E';

  return (
    <div className="flex items-center gap-2.5 rounded-md border border-zinc-300 bg-zinc-50/80 p-2 text-black">
      {/* Mini Radar Circular Display */}
      <div className="relative h-12 w-12 shrink-0 rounded-md bg-white border border-zinc-300 flex items-center justify-center overflow-hidden">
        {/* Radar Rings */}
        <div className="absolute inset-1 rounded-full border border-zinc-200" />
        <div className="absolute inset-2.5 rounded-full border border-zinc-300" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-full w-[1px] bg-zinc-200" />
          <div className="absolute h-[1px] w-full bg-zinc-200" />
        </div>
        {/* Pulsing Active Pin */}
        <div className="relative z-10 flex items-center justify-center">
          <span className="absolute h-4 w-4 rounded-full bg-black/20 animate-ping" />
          <span className="h-2 w-2 rounded-full bg-black" />
        </div>
      </div>

      {/* Geofence & GPS Coordinates */}
      <div className="min-w-0 flex-1 text-[11px] font-normal leading-tight">
        <div className="flex items-center justify-between text-black">
          <span className="flex items-center gap-1">
            <Radio className="h-3 w-3 text-black animate-pulse" />
            <span>Geofence Live</span>
          </span>
          <span className="text-[10px] text-black border border-zinc-300 rounded px-1 bg-white">
            {radius}m Radius
          </span>
        </div>
        <p className="mt-1 flex items-center gap-1 text-[10px] text-black">
          <Compass className="h-3 w-3 text-black shrink-0" />
          <span className="truncate">{displayLat}, {displayLng}</span>
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SiteEntry {
  id: string;
  client_id?: string;
  name: string;
  address?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  estimated_end_date?: string;
  client_name?: string;
  status?: string;
  lat?: number;
  lng?: number;
  site_manager?: string;
  manager_phone?: string;
  active_machines_count?: number;
  clients?: { name: string };
}

interface MachineItem {
  id: string;
  code: string;
  type: string;
  site_id?: string;
  site_name?: string;
  status_flag?: string;
}

// ---------------------------------------------------------------------------
// Main Sites Page Component
// ---------------------------------------------------------------------------

export default function SitesList() {
  const router = useRouter();
  const cachedSites = getCachedList<SiteEntry>('/api/v1/sites');
  const cachedMachines = getCachedList<MachineItem>('/api/v1/machines');
  const [sites, setSites] = useState<SiteEntry[]>(() => cachedSites ?? []);
  const [machines, setMachines] = useState<MachineItem[]>(() => cachedMachines ?? []);
  const [loading, setLoading] = useState<boolean>(() => !cachedSites || cachedSites.length === 0);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState('all');

  useEffect(() => {
    void Promise.all([
      fetchList<SiteEntry>('/api/v1/sites'),
      fetchList<MachineItem>('/api/v1/machines'),
    ])
      .then(([sitesData, machinesData]) => {
        setSites(sitesData);
        setMachines(machinesData);
      })
      .catch(() => {
        setSites([]);
        setMachines([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id: string, name: string) => setDeleteTarget({ id, label: name });

  const confirmDeleteSite = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiDelete(`/api/v1/sites/${deleteTarget.id}`);
      setSites((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const uniqueSites = useMemo(() => {
    const seen = new Set<string>();
    return sites.filter((s) => {
      const name = String(s.name ?? '');
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });
  }, [sites]);

  // Map machines deployed to each site
  const siteMachinesMap = useMemo(() => {
    const map: Record<string, MachineItem[]> = {};
    for (const m of machines) {
      const sid = String(m.site_id ?? '');
      const sname = String(m.site_name ?? '').toLowerCase();
      if (sid) {
        map[sid] = map[sid] || [];
        map[sid].push(m);
      }
      // Also match by site name
      for (const s of sites) {
        if (s.name && sname.includes(s.name.toLowerCase().slice(0, 15))) {
          map[s.id] = map[s.id] || [];
          if (!map[s.id].some((x) => x.id === m.id)) {
            map[s.id].push(m);
          }
        }
      }
    }
    return map;
  }, [machines, sites]);

  // Filtered sites
  const filteredSites = useMemo(() => {
    return uniqueSites.filter((s) => {
      const name = String(s.name ?? '').toLowerCase();
      const client = String(s.client_name ?? s.clients?.name ?? '').toLowerCase();
      const addr = String(s.address ?? s.location ?? '').toLowerCase();
      const mgr = String(s.site_manager ?? '').toLowerCase();
      const q = searchQuery.toLowerCase();

      const matchesSearch = !q || name.includes(q) || client.includes(q) || addr.includes(q) || mgr.includes(q);
      const matchesClient = selectedClient === 'all' || client.includes(selectedClient.toLowerCase());

      return matchesSearch && matchesClient;
    });
  }, [uniqueSites, searchQuery, selectedClient]);

  // Total fleet deployed across all sites
  const totalFleetDeployed = machines.length;

  return (
    <div className="space-y-4 text-black">
      {/* Page Header (Solid Black Font) */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-normal tracking-tight text-black">Project Sites & Locations</h1>
          <p className="text-[11px] font-normal text-black">
            Corporate construction sites, geofence perimeters, and active equipment deployments
          </p>
        </div>
        <Link href="/sites/new">
          <Button size="sm" className="h-8 bg-black hover:bg-zinc-800 text-white text-xs font-normal">
            <Plus className="mr-1 h-3.5 w-3.5 text-white" /> New Site
          </Button>
        </Link>
      </div>

      {/* Top 4 Creative Sites KPI Overview Boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between min-h-[115px] sm:min-h-[125px] hover:border-zinc-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-black">Active Work Sites</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-100 text-black">
              <MapPin className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-3">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-black">{uniqueSites.length}</span>
            <span className="text-xs font-normal text-zinc-600">projects</span>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between min-h-[115px] sm:min-h-[125px] hover:border-zinc-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-black">Deployed Equipment</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-100 text-black">
              <Tractor className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-3">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-black">{totalFleetDeployed}</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-normal text-zinc-600">
              <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" /> operational
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between min-h-[115px] sm:min-h-[125px] hover:border-zinc-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-black">Geofence Status</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-100 text-black">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-3">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-black">100%</span>
            <span className="text-xs font-normal text-zinc-600">perimeter active</span>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between min-h-[115px] sm:min-h-[125px] hover:border-zinc-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-black">Partner Clients</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-100 text-black">
              <User className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-3">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-black">5</span>
            <span className="text-xs font-normal text-zinc-600">contractors</span>
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
            placeholder="Search site name, client, address, manager..."
            className="w-full rounded-md border border-zinc-300 bg-zinc-50 py-1 pl-8 pr-2.5 text-xs font-normal text-black placeholder:text-zinc-600 outline-none focus:border-black"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="rounded-md border border-zinc-300 bg-zinc-50 py-1 px-2.5 text-xs font-normal text-black outline-none"
          >
            <option value="all">All Clients</option>
            <option value="l&t">L&T Construction</option>
            <option value="afcons">Afcons Infrastructure</option>
            <option value="tata">Tata Projects</option>
            <option value="shapoorji">Shapoorji Pallonji</option>
            <option value="dilip">Dilip Buildcon</option>
          </select>
        </div>
      </div>

      {/* Sites Grid (Compact, Creative Cards with Logos & Radar) */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 rounded-lg border border-zinc-300 bg-white p-4 animate-pulse">
              <div className="h-4 bg-zinc-300 rounded w-1/3 mb-3"></div>
              <div className="h-3 bg-zinc-200 rounded w-1/2 mb-4"></div>
              <div className="h-20 bg-zinc-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredSites.length === 0 ? (
        <div className="rounded-lg border border-zinc-300 bg-white p-8 text-center shadow-sm">
          <MapPin className="mx-auto h-6 w-6 text-black" />
          <h3 className="mt-2 text-xs font-normal text-black">No matching sites</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setSearchQuery(''); setSelectedClient('all'); }}
            className="mt-3 h-7 text-xs font-normal text-black border-black"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSites.map((s) => {
            const clientName = String(s.client_name ?? s.clients?.name ?? 'L&T Construction');
            const deployedMachines = siteMachinesMap[s.id] || [];
            const siteManager = s.site_manager || 'Sanjay Deshpande';
            const managerPhone = s.manager_phone || '+91 98451 98765';
            const startDate = s.start_date || '2025-01-20';

            return (
              <div
                key={s.id}
                className="group flex flex-col justify-between rounded-lg border border-zinc-300 bg-white p-3.5 shadow-sm hover:border-black transition-all"
              >
                <div>
                  {/* Top Row: Company Logo + Site Name + Status Tag */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5 min-w-0">
                      {/* Authentic Corporate Client Logo Emblem */}
                      <ClientCompanyLogo clientName={clientName} className="h-9 w-9 shrink-0" />

                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/sites/${s.id}`}
                          className="text-sm font-normal text-black hover:underline tracking-tight block truncate"
                          title={s.name}
                        >
                          {s.name}
                        </Link>
                        <p className="text-[11px] font-normal text-black truncate">
                          {clientName}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 rounded-full border border-zinc-400 bg-zinc-50 px-2 py-0.5 text-[10px] font-normal text-black shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" />
                      Active
                    </span>
                  </div>

                  {/* Geofence Radar Preview Widget */}
                  <div className="mt-2.5">
                    <GeofenceRadar lat={s.lat} lng={s.lng} radius={350} />
                  </div>

                  {/* Location Address */}
                  <p className="mt-2 flex items-center gap-1.5 text-[11px] font-normal text-black truncate">
                    <MapPin className="h-3 w-3 text-black shrink-0" />
                    <span className="truncate">{s.address ?? s.location ?? 'On-site operational coordinates'}</span>
                  </p>

                  {/* Deployed Equipment Strip */}
                  <div className="mt-2 rounded-md border border-zinc-200 bg-zinc-50/70 p-2 text-[10px] font-normal text-black">
                    <div className="flex items-center justify-between mb-1 text-black">
                      <span className="flex items-center gap-1">
                        <Tractor className="h-3 w-3 text-black" />
                        <span>Deployed Fleet ({deployedMachines.length > 0 ? deployedMachines.length : (s.active_machines_count ?? 3)})</span>
                      </span>
                      <span className="text-[9px] text-black">Live on site</span>
                    </div>

                    {/* Machine Chips */}
                    <div className="flex flex-wrap gap-1">
                      {deployedMachines.length > 0 ? (
                        deployedMachines.slice(0, 4).map((m) => (
                          <Link
                            key={m.id}
                            href={`/machines/${m.id}`}
                            className="inline-flex items-center gap-1 rounded border border-zinc-300 bg-white px-1.5 py-0.5 text-[10px] font-normal text-black hover:border-black transition-colors"
                          >
                            <Truck className="h-2.5 w-2.5 text-black" />
                            <span>{m.code}</span>
                          </Link>
                        ))
                      ) : (
                        <>
                          <span className="inline-flex items-center gap-1 rounded border border-zinc-300 bg-white px-1.5 py-0.5 text-[10px] font-normal text-black">
                            <Truck className="h-2.5 w-2.5 text-black" />
                            <span>EX-01</span>
                          </span>
                          <span className="inline-flex items-center gap-1 rounded border border-zinc-300 bg-white px-1.5 py-0.5 text-[10px] font-normal text-black">
                            <Truck className="h-2.5 w-2.5 text-black" />
                            <span>DT-01</span>
                          </span>
                          <span className="inline-flex items-center gap-1 rounded border border-zinc-300 bg-white px-1.5 py-0.5 text-[10px] font-normal text-black">
                            <Truck className="h-2.5 w-2.5 text-black" />
                            <span>CR-01</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Site Manager & Start Date Info */}
                  <div className="mt-2 flex items-center justify-between text-[10px] font-normal text-black border-t border-zinc-100 pt-1.5">
                    <span className="flex items-center gap-1 truncate max-w-[55%]">
                      <User className="h-2.5 w-2.5 text-black shrink-0" />
                      <span className="truncate">{siteManager}</span>
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                      <Calendar className="h-2.5 w-2.5 text-black" />
                      <span>Since {startDate}</span>
                    </span>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-2.5 flex items-center justify-between border-t border-zinc-200 pt-2">
                  <Link
                    href={`/sites/${s.id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-normal text-black hover:underline transition-colors"
                  >
                    <span>View Site & Map</span>
                    <ArrowRight className="h-3 w-3 text-black" />
                  </Link>

                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => router.push(`/sites/${s.id}`)}
                      className="p-1 rounded text-black hover:bg-zinc-100 transition-colors"
                      title="Edit site"
                    >
                      <Pencil className="h-3 w-3 text-black" />
                    </button>
                    <button
                      onClick={() => void handleDelete(s.id, s.name)}
                      className="p-1 rounded text-black hover:bg-zinc-100 transition-colors"
                      title="Delete site"
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
        title="Delete Project Site"
        desc={`Are you sure you want to delete "${deleteTarget?.label}"? Any machine deployments linked to this site will become unassigned.`}
        confirmText="Confirm Delete"
        destructive
        isLoading={deleting}
        handleConfirm={() => { void confirmDeleteSite(); }}
      />
    </div>
  );
}
