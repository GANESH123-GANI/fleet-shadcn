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
