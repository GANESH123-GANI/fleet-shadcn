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
  LayoutGrid,
  List,
  ArrowUpDown,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchList, getCachedList } from '@/lib/api/fetch-list';
import { apiDelete } from '@/lib/api/mutations';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { MachineSideDiagram } from '@/components/machines/machine-diagrams';

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
  const cached = getCachedList<Record<string, unknown>>('/api/v1/machines');
  const [machines, setMachines] = useState<Record<string, unknown>[]>(() => cached ?? []);
  const [loading, setLoading] = useState<boolean>(() => !cached || cached.length === 0);
  const [apiError, setApiError] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filter, Sort & View Freedom states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

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
    const list = machines.filter((m) => {
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

    return list.sort((a, b) => {
      if (sortBy === 'code') {
        return String(a.code ?? '').localeCompare(String(b.code ?? ''));
      }
      if (sortBy === 'rate-desc') {
        return num(b.hourly_rate) - num(a.hourly_rate);
      }
      if (sortBy === 'rate-asc') {
        return num(a.hourly_rate) - num(b.hourly_rate);
      }
      if (sortBy === 'meter-desc') {
        return num(b.current_meter) - num(a.current_meter);
      }
      if (sortBy === 'fuel-asc') {
        return num(a.fuel_level_pct) - num(b.fuel_level_pct);
      }
      return 0;
    });
  }, [machines, searchQuery, selectedType, selectedStatus, sortBy]);

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

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-black">Machines Fleet</h1>
          <p className="text-[11px] font-normal text-zinc-600">
            Technical equipment overview, CAD blueprints, and active telemetry
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/machines/new">
            <Button size="sm" className="h-8 bg-black hover:bg-zinc-800 text-white text-xs font-medium">
              <Plus className="mr-1 h-3.5 w-3.5 text-white" /> Add Machine
            </Button>
          </Link>
        </div>
      </div>

      {/* Interactive 4-Metric Overview Boxes (Freedom to click to filter status) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setSelectedStatus('all')}
          className={`rounded-xl border p-4 sm:p-5 text-left transition-all cursor-pointer min-h-[115px] sm:min-h-[125px] flex flex-col justify-between shadow-xs ${
            selectedStatus === 'all'
              ? 'border-black bg-zinc-50 ring-1 ring-black shadow-sm'
              : 'border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50/60'
          }`}
          title="Click to view all machines"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-black">Total Fleet</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-100 text-black">
              <Truck className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-3">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-black">{machines.length}</span>
            <span className="text-xs font-normal text-zinc-600">assets</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === 'operational' ? 'all' : 'operational')}
          className={`rounded-xl border p-4 sm:p-5 text-left transition-all cursor-pointer min-h-[115px] sm:min-h-[125px] flex flex-col justify-between shadow-xs ${
            selectedStatus === 'operational'
              ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600 shadow-sm'
              : 'border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50/60'
          }`}
          title="Click to filter operational machines"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-black">Operational</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600">
              <CheckCircle className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-3">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-black">{operationalCount}</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-normal text-zinc-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" /> on site
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === 'standby' ? 'all' : 'standby')}
          className={`rounded-xl border p-4 sm:p-5 text-left transition-all cursor-pointer min-h-[115px] sm:min-h-[125px] flex flex-col justify-between shadow-xs ${
            selectedStatus === 'standby'
              ? 'border-amber-600 bg-amber-50/70 ring-1 ring-amber-600 shadow-sm'
              : 'border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50/60'
          }`}
          title="Click to filter standby/idle machines"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-black">Standby / Idle</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600">
              <Clock className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-3">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-black">{standbyCount}</span>
            <span className="text-xs font-normal text-zinc-600">ready</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === 'service' ? 'all' : 'service')}
          className={`rounded-xl border p-4 sm:p-5 text-left transition-all cursor-pointer min-h-[115px] sm:min-h-[125px] flex flex-col justify-between shadow-xs ${
            selectedStatus === 'service'
              ? 'border-rose-600 bg-rose-50/70 ring-1 ring-rose-600 shadow-sm'
              : 'border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50/60'
          }`}
          title="Click to filter in-service machines"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-black">In Service</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600">
              <Wrench className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-3">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-black">{serviceCount}</span>
            <span className="text-xs font-normal text-zinc-600">scheduled</span>
          </div>
        </button>
      </div>

      {/* Comprehensive Search, Sort, Filters & View Mode Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-lg border border-zinc-300 bg-white p-2.5 shadow-sm">
        {/* Search Input with Clear Button */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code, model, site, client..."
            className="w-full rounded-md border border-zinc-300 bg-zinc-50 py-1.5 pl-8 pr-7 text-xs text-black placeholder:text-zinc-500 outline-none focus:border-black"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 text-zinc-400 hover:text-black p-0.5"
              title="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Filter & Sort Controls (Freedom to customize output) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Machine Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-md border border-zinc-300 bg-zinc-50 py-1.5 px-2.5 text-xs font-medium text-black outline-none focus:border-black cursor-pointer"
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

          {/* Operational Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-md border border-zinc-300 bg-zinc-50 py-1.5 px-2.5 text-xs font-medium text-black outline-none focus:border-black cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="operational">Operational</option>
            <option value="standby">Standby</option>
            <option value="service">In Service</option>
          </select>

          {/* Sort Selector (Freedom to reorder fleet items) */}
          <div className="flex items-center gap-1 rounded-md border border-zinc-300 bg-zinc-50 py-1.5 px-2 text-xs font-medium text-black">
            <ArrowUpDown className="h-3 w-3 text-zinc-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent outline-none text-xs text-black cursor-pointer"
            >
              <option value="newest">Sort: Newest</option>
              <option value="code">Sort: Code (A-Z)</option>
              <option value="rate-desc">Sort: Rate (High-Low)</option>
              <option value="rate-asc">Sort: Rate (Low-High)</option>
              <option value="meter-desc">Sort: Hours (High-Low)</option>
              <option value="fuel-asc">Sort: Fuel (Low-High)</option>
            </select>
          </div>

          {/* View Mode Toggle: Grid vs Table (Freedom to select display layout) */}
          <div className="flex items-center rounded-md border border-zinc-300 bg-zinc-100 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-black shadow-2xs font-semibold'
                  : 'text-zinc-600 hover:text-black'
              }`}
              title="Card Blueprint Grid View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-black shadow-2xs font-semibold'
                  : 'text-zinc-600 hover:text-black'
              }`}
              title="Dense Table View"
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {(searchQuery || selectedType !== 'all' || selectedStatus !== 'all' || sortBy !== 'newest') && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] text-zinc-500 font-medium">Active filters:</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 border border-zinc-300 px-2 py-0.5 text-[11px] text-black">
              Search: "{searchQuery}"
              <button onClick={() => setSearchQuery('')} className="hover:text-red-600">✕</button>
            </span>
          )}
          {selectedType !== 'all' && (
            <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 border border-zinc-300 px-2 py-0.5 text-[11px] text-black capitalize">
              Type: {selectedType.replace('_', ' ')}
              <button onClick={() => setSelectedType('all')} className="hover:text-red-600">✕</button>
            </span>
          )}
          {selectedStatus !== 'all' && (
            <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 border border-zinc-300 px-2 py-0.5 text-[11px] text-black capitalize">
              Status: {selectedStatus}
              <button onClick={() => setSelectedStatus('all')} className="hover:text-red-600">✕</button>
            </span>
          )}
          {sortBy !== 'newest' && (
            <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 border border-zinc-300 px-2 py-0.5 text-[11px] text-black">
              Sort: {sortBy}
              <button onClick={() => setSortBy('newest')} className="hover:text-red-600">✕</button>
            </span>
          )}
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedType('all');
              setSelectedStatus('all');
              setSortBy('newest');
            }}
            className="text-[11px] text-zinc-600 hover:text-black underline ml-1 cursor-pointer font-medium"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Content: Loading Skeleton / Empty State / Grid View / Table View */}
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
          <h3 className="mt-2 text-xs font-semibold text-black">No matching machines found</h3>
          <p className="mt-1 text-xs text-zinc-500">Try adjusting your filters or search terms.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setSearchQuery(''); setSelectedType('all'); setSelectedStatus('all'); setSortBy('newest'); }}
            className="mt-3 h-7 text-xs font-medium text-black border-zinc-400"
          >
            Reset All Filters
          </Button>
        </div>
      ) : viewMode === 'table' ? (
        /* High-Density Responsive Table View */
        <div className="rounded-lg border border-zinc-300 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 bg-zinc-50 font-semibold text-black">
                <tr>
                  <th className="py-2.5 px-3">Asset & Schematic</th>
                  <th className="py-2.5 px-3">Make / Model</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Rate (₹/hr)</th>
                  <th className="py-2.5 px-3">Meter Reading</th>
                  <th className="py-2.5 px-3">Fuel Level</th>
                  <th className="py-2.5 px-3">Location & Client</th>
                  <th className="py-2.5 px-3">Operator</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredMachines.map((m) => {
                  const rawStatus = String(m.status_flag ?? '').toLowerCase();
                  const isWorking = rawStatus === 'active' || rawStatus === 'working';
                  const isService = rawStatus === 'service' || rawStatus === 'maintenance';
                  const statusLabel = isWorking ? 'Operational' : isService ? 'In Service' : 'Standby';
                  const currentMeter = num(m.current_meter, 0);
                  const meterUnit = String(m.meter_unit_label ?? m.primary_meter_type ?? 'hrs');
                  const fuelPct = num(m.fuel_level_pct, 68);
                  const siteName = String(m.site_name ?? m.site ?? 'Bangalore Metro Phase 2');
                  const clientName = String(m.client_name ?? m.client ?? 'L&T Construction');
                  const opName = String(m.operator_name ?? 'Assigned Operator');
                  const hourlyRate = num(m.hourly_rate, 2500);
                  const machineType = String(m.type ?? 'excavator');

                  return (
                    <tr key={String(m.id)} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-12 shrink-0 flex items-center justify-center rounded border border-zinc-200 bg-zinc-50 p-0.5">
                            <MachineSideDiagram type={machineType} />
                          </div>
                          <div>
                            <Link href={`/machines/${m.id}`} className="font-mono font-bold text-black hover:underline">
                              {String(m.code || 'MCH')}
                            </Link>
                            <p className="text-[10px] text-zinc-500 capitalize">{machineType.replace('_', ' ')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <p className="font-medium text-black">{String(m.make || 'Generic')}</p>
                        <p className="text-[10px] text-zinc-500">{String(m.model || 'Model')}</p>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                          isWorking
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                            : isService
                            ? 'border-rose-300 bg-rose-50 text-rose-800'
                            : 'border-zinc-300 bg-zinc-100 text-zinc-800'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            isWorking ? 'bg-emerald-600 animate-pulse' : isService ? 'bg-rose-600' : 'bg-zinc-500'
                          }`} />
                          {statusLabel}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-black">
                        ₹{hourlyRate.toLocaleString('en-IN')}/hr
                      </td>
                      <td className="py-2.5 px-3 text-zinc-700">
                        {currentMeter.toLocaleString()} {meterUnit}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-black">{fuelPct}%</span>
                          <div className="w-12 h-1.5 rounded-full bg-zinc-200 overflow-hidden">
                            <div
                              className={`h-full ${fuelPct < 25 ? 'bg-rose-500' : fuelPct < 50 ? 'bg-amber-500' : 'bg-black'}`}
                              style={{ width: `${fuelPct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <p className="truncate max-w-[150px] font-medium text-black" title={siteName}>{siteName}</p>
                        <p className="text-[10px] text-zinc-500 truncate max-w-[150px]">{clientName}</p>
                      </td>
                      <td className="py-2.5 px-3 text-zinc-700">
                        {opName}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/machines/${m.id}`}
                            className="rounded p-1 text-zinc-600 hover:text-black hover:bg-zinc-100 transition-colors"
                            title="View Telemetry"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            onClick={() => router.push(`/machines/${m.id}`)}
                            className="rounded p-1 text-zinc-600 hover:text-black hover:bg-zinc-100 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => void handleDelete(String(m.id), String(m.code || 'Machine'))}
                            className="rounded p-1 text-zinc-400 hover:text-red-600 hover:bg-zinc-100 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Blueprint Card Grid View */
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
                          className="text-sm font-semibold text-black hover:underline tracking-tight"
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
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-black hover:underline transition-colors"
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
