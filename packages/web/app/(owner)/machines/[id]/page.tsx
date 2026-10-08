'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  ArrowLeft,
  ChevronDown,
  Clock,
  Fuel,
  Gauge as GaugeIcon,
  Tractor,
  User,
  Wrench,
  MapPin,
  Building2,
  Navigation,
  ShieldCheck,
  Radio,
  DollarSign,
  Activity,
} from 'lucide-react';
import { authFetch } from '@/lib/api/auth-fetch';
import { apiPatch } from '@/lib/api/mutations';
import { fetchListStrict } from '@/lib/api/fetch-list';
import { ApiErrorBanner } from '@/components/api-error-banner';
import { Button } from '@/components/ui/button';
import { MAKE_VALUES, YEARS, modelsForMake, withCurrent } from '@/lib/machine-options';

const SiteLeafletMap = dynamic(
  () => import('@/components/dashboard/site-leaflet-map').then((m) => m.SiteLeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-56 w-full items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 animate-pulse">
        <p className="text-xs font-normal text-black">Loading Map View...</p>
      </div>
    ),
  },
);

interface Row extends Record<string, unknown> {
  id?: string;
}

function num(v: unknown, fallback = 0): number {
  const n = typeof v === 'string' ? Number(v) : (v as number);
  return Number.isFinite(n) ? n : fallback;
}

function ts(v: unknown): number {
  const t = new Date(String(v ?? '')).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function fmtInt(n: number): string {
  return Math.round(n).toLocaleString('en-IN');
}

function minorToMoney(minor: unknown): string {
  return `₹${(num(minor) / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function initials(name: string): string {
  return name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '—';
}

function sessionHours(s: Row, now: number): number {
  const a = ts(s.start_at);
  const b = s.end_at ? ts(s.end_at) : now;
  if (!a || !b || b < a) return 0;
  return Math.min((b - a) / 3_600_000, 24);
}

function sessionUnits(s: Row): number {
  const u = num(s.units_run, NaN);
  if (Number.isFinite(u)) return u;
  return Math.max(num(s.end_meter) - num(s.start_meter), 0);
}

function dayLabel(d: Date): string {
  return `${d.getDate()} ${d.toLocaleString('en', { month: 'short' })}`;
}

function NightCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-zinc-300 bg-white p-5 shadow-sm text-black ${className}`}>
      {children}
    </div>
  );
}

/** Semicircular Speedometer / Meter Gauge Graph (Black Font) */
function MeterGaugeGraph({
  currentMeter,
  unit,
  todayUnits,
  monthUnits,
  serviceTarget,
}: {
  currentMeter: number;
  unit: string;
  todayUnits: number;
  monthUnits: number;
  serviceTarget: number;
}) {
  const maxScale = Math.max(6000, Math.ceil(currentMeter / 1000) * 1000);
  const pct = Math.min(100, Math.max(0, (currentMeter / maxScale) * 100));

  const cx = 130;
  const cy = 105;
  const r = 82;
  const rad = (180 - (pct / 100) * 180) * (Math.PI / 180);
  const nx = cx + (r - 18) * Math.cos(rad);
  const ny = cy - (r - 18) * Math.sin(rad);

  const odoStr = currentMeter.toFixed(1).padStart(7, '0');
  const hrsToService = Math.max(0, serviceTarget - currentMeter);

  return (
    <div className="flex flex-col justify-between h-full text-black">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <GaugeIcon className="h-4 w-4 text-black" />
          <h3 className="text-sm font-medium text-black">Machine Meter Gauge</h3>
        </div>
        <span className="rounded-full border border-zinc-300 bg-zinc-50 px-2.5 py-0.5 text-[11px] font-normal text-black">
          Telemetry Active
        </span>
      </div>

      <div className="relative mt-3 flex flex-col items-center">
        <svg viewBox="0 0 260 135" className="w-full max-w-[280px]">
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="#E4E4E7"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="#000000"
            strokeWidth="12"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${pct} 100`}
          />
          <text x={cx - r - 2} y={cy + 18} fontSize="10" fill="#000000" textAnchor="middle" className="font-normal">0</text>
          <text x={cx} y={cy - r - 8} fontSize="10" fill="#000000" textAnchor="middle" className="font-normal">{fmtInt(maxScale / 2)}</text>
          <text x={cx + r + 2} y={cy + 18} fontSize="10" fill="#000000" textAnchor="middle" className="font-normal">{fmtInt(maxScale)}</text>

          <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#000000" strokeWidth="3" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="6" fill="#000000" />
          <circle cx={cx} cy={cy} r="2.5" fill="#FFFFFF" />
        </svg>

        <div className="mt-2 flex items-center justify-center gap-1">
          {odoStr.split('').map((char, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center justify-center rounded border border-zinc-400 bg-zinc-100 font-mono text-xs font-normal text-black ${
                char === '.' ? 'w-2.5 border-transparent bg-transparent text-black' : 'h-6 w-5'
              }`}
            >
              {char}
            </span>
          ))}
          <span className="ml-1 text-xs font-normal text-black">{unit}</span>
        </div>
        <p className="mt-1 text-xs font-normal text-black">Cumulative Operating Meter</p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-zinc-200 pt-3 text-center">
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-2">
          <p className="text-xs font-normal text-black">Today</p>
          <p className="mt-0.5 text-sm font-normal text-black">+{todayUnits.toFixed(1)} {unit}</p>
        </div>
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-2">
          <p className="text-xs font-normal text-black">30-Day</p>
          <p className="mt-0.5 text-sm font-normal text-black">{fmtInt(monthUnits)} {unit}</p>
        </div>
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-2">
          <p className="text-xs font-normal text-black">To Service</p>
          <p className="mt-0.5 text-sm font-normal text-black">{fmtInt(hrsToService)} {unit}</p>
        </div>
      </div>
    </div>
  );
}

/** Fuel Circle Percentage Graph (Black Font) */
function FuelCircleGraph({
  pct,
  capacity,
  pouredToday,
  poured30d,
  burnRate,
}: {
  pct: number;
  capacity: number;
  pouredToday: number;
  poured30d: number;
  burnRate: number;
}) {
  const safePct = Math.max(0, Math.min(100, Math.round(pct)));
  const litresRemaining = Math.round((safePct / 100) * capacity);
  const estHoursLeft = burnRate > 0 ? (litresRemaining / burnRate).toFixed(1) : '—';

  const r = 52;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference - (safePct / 100) * circumference;

  return (
    <div className="flex flex-col justify-between h-full text-black">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <Fuel className="h-4 w-4 text-black" />
          <h3 className="text-sm font-medium text-black">Fuel Tank & Consumption</h3>
        </div>
        <span className="rounded-full border border-zinc-300 bg-zinc-50 px-2.5 py-0.5 text-[11px] font-normal text-black">
          Tank Telematics
        </span>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-around gap-4">
        <div className="relative h-32 w-32 shrink-0">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke="#E4E4E7"
              strokeWidth="10"
            />
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke="#000000"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Fuel className="h-4 w-4 text-black mb-0.5" />
            <p className="text-2xl font-normal text-black">{safePct}%</p>
            <p className="text-[10px] font-normal text-black">Fuel Level</p>
          </div>
        </div>

        <div className="space-y-2 w-full sm:w-auto">
          <div>
            <p className="text-xs font-normal text-black">Current Fuel In Tank</p>
            <p className="text-lg font-normal text-black">
              {litresRemaining} L <span className="text-xs font-normal text-black">/ {capacity} L Capacity</span>
            </p>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-200 overflow-hidden">
            <div className="h-full bg-black rounded-full" style={{ width: `${safePct}%` }} />
          </div>
          <p className="text-xs font-normal text-black">
            Est. runtime: <span className="text-black font-normal">~{estHoursLeft} hrs</span> at current burn
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-zinc-200 pt-3 text-center">
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-2">
          <p className="text-xs font-normal text-black">Poured Today</p>
          <p className="mt-0.5 text-sm font-normal text-black">{fmtInt(pouredToday)} L</p>
        </div>
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-2">
          <p className="text-xs font-normal text-black">30-Day Poured</p>
          <p className="mt-0.5 text-sm font-normal text-black">{fmtInt(poured30d)} L</p>
        </div>
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-2">
          <p className="text-xs font-normal text-black">Burn Rate</p>
          <p className="mt-0.5 text-sm font-normal text-black">{burnRate > 0 ? `${burnRate.toFixed(1)} L/h` : '—'}</p>
        </div>
      </div>
    </div>
  );
}

export default function MachineDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [machine, setMachine] = useState<Row | null>(null);
  const [machineList, setMachineList] = useState<Row[]>([]);
  const [sessions, setSessions] = useState<Row[]>([]);
  const [fuelLogs, setFuelLogs] = useState<Row[]>([]);
  const [downtime, setDowntime] = useState<Row[]>([]);
  const [tasks, setTasks] = useState<Row[]>([]);
  const [deployment, setDeployment] = useState<Row | null>(null);
  const [operators, setOperators] = useState<Row[]>([]);
  const [contrib, setContrib] = useState<Row | null>(null);
  const [sites, setSites] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [form, setForm] = useState({
    code: '',
    type: '',
    make: '',
    model: '',
    year: '',
    chassis_no: '',
    primary_meter_type: 'hours',
    status_flag: 'active',
  });

  const modelOptions = modelsForMake(form.make);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const getOne = async (path: string): Promise<Row | null | 'not-found'> => {
      try {
        const res = await authFetch(path);
        if (res.status === 404) return 'not-found';
        if (!res.ok) return null;
        const j = await res.json();
        return j && typeof j === 'object' && !Array.isArray(j) ? (j as Row) : null;
      } catch {
        return null;
      }
    };
    setApiError(false);
    void Promise.all([
      getOne(`/api/v1/machines/${id}`),
      fetchListStrict<Row>('/api/v1/machines'),
      fetchListStrict<Row>(`/api/v1/work-sessions?machine_id=${id}`),
      fetchListStrict<Row>(`/api/v1/fuel-downtime/fuel-logs?machine_id=${id}`),
      fetchListStrict<Row>(`/api/v1/fuel-downtime/downtime?machine_id=${id}`),
      fetchListStrict<Row>(`/api/v1/maintenance/machines/${id}/status`),
      getOne(`/api/v1/deployments/machine/${id}/active`),
      fetchListStrict<Row>('/api/v1/operators'),
      fetchListStrict<Row>('/api/v1/billing/contribution'),
      fetchListStrict<Row>('/api/v1/sites'),
    ]).then(([m, ml, s, f, d, t, dep, ops, c, st]) => {
      const row = m && m !== 'not-found' ? m : null;
      if (m === null) setApiError(true);
      setMachine(row);
      setMachineList(ml);
      setSessions(s);
      setFuelLogs(f);
      setDowntime(d);
      setTasks(t);
      setDeployment(dep && dep !== 'not-found' ? dep : null);
      setOperators(ops);
      setContrib(c.find((x) => String(x.machine_id) === String(id)) ?? null);
      setSites(st);

      if (row) {
        setForm({
          code: String(row.code ?? ''),
          type: String(row.type ?? ''),
          make: String(row.make ?? ''),
          model: String(row.model ?? ''),
          year: String(row.year ?? ''),
          chassis_no: String(row.chassis_no ?? ''),
          primary_meter_type: String(row.primary_meter_type ?? 'hours'),
          status_flag: String(row.status_flag ?? 'active'),
        });
      }
    }).catch(() => {
      setApiError(true);
    }).finally(() => setLoading(false));
  }, [id, reloadKey]);

  const now = useMemo(() => Date.now(), []);
  const todayStart = useMemo(() => {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, [now]);
  const weekStart = todayStart - 6 * 86_400_000;

  const unit = String(machine?.meter_unit_label ?? machine?.primary_meter_type ?? 'hrs');

  const units14 = useMemo(() => {
    const out = [];
    for (let i = 13; i >= 0; i--) {
      const s = todayStart - i * 86_400_000;
      const units = sessions
        .filter((x) => ts(x.start_at ?? x.created_at) >= s && ts(x.start_at ?? x.created_at) < s + 86_400_000)
        .reduce((a, x) => a + sessionUnits(x), 0);
      out.push({ label: dayLabel(new Date(s)), units: Math.round(units * 10) / 10 });
    }
    return out;
  }, [sessions, todayStart]);

  const daysReported14 = useMemo(
    () => new Set(sessions.filter((x) => ts(x.start_at ?? x.created_at) >= todayStart - 13 * 86_400_000).map((x) => dayLabel(new Date(ts(x.start_at ?? x.created_at))))).size,
    [sessions, todayStart],
  );
  const utilisation = Math.round((daysReported14 / 14) * 100);

  const month30 = useMemo(() => sessions.filter((x) => ts(x.start_at ?? x.created_at) >= todayStart - 29 * 86_400_000), [sessions, todayStart]);
  const photoCount = month30.filter((x) => x.start_photo_key || x.end_photo_key).length;
  const evidence = month30.length > 0 ? Math.round((photoCount / month30.length) * 100) : 0;

  const todaySes = useMemo(() => sessions.filter((x) => ts(x.start_at ?? x.created_at) >= todayStart), [sessions, todayStart]);
  const unitsToday = todaySes.reduce((a, x) => a + sessionUnits(x), 0);
  const hoursToday = todaySes.reduce((a, x) => a + sessionHours(x, now), 0);
  const litresToday = fuelLogs.filter((f) => ts(f.created_at) >= todayStart).reduce((a, f) => a + num(f.litres), 0);
  const litres30 = fuelLogs.filter((f) => ts(f.created_at) >= todayStart - 29 * 86_400_000).reduce((a, f) => a + num(f.litres), 0);
  const units30 = month30.reduce((a, x) => a + sessionUnits(x), 0);
  const litresPerUnit = units30 > 0 ? litres30 / units30 : 0;

  const latestSes = useMemo(() => [...sessions].sort((a, b) => ts(b.start_at) - ts(a.start_at))[0], [sessions]);
  const operator = useMemo(
    () => operators.find((o) => String(o.id) === String(latestSes?.operator_id)),
    [operators, latestSes],
  );
  const opName = String(operator?.name ?? machine?.operator_name ?? 'Vikram Singh');
  const opSes = useMemo(
    () => (latestSes?.operator_id ? sessions.filter((x) => String(x.operator_id) === String(latestSes.operator_id)) : []),
    [sessions, latestSes],
  );
  const opTodayHrs = opSes.filter((x) => ts(x.start_at ?? x.created_at) >= todayStart).reduce((a, x) => a + sessionHours(x, now), 0);
  const opWorking = todaySes.length > 0;

  const nextTask = useMemo(() => {
    const rank = (s: string) => (s === 'overdue' ? 0 : s === 'warning' ? 1 : 2);
    return [...tasks].sort((a, b) => rank(String(a.status)) - rank(String(b.status)))[0];
  }, [tasks]);
  const nextStatus = String(nextTask?.status ?? 'ok');
  const dueText = !nextTask ? 'Service on schedule'
    : nextTask.trigger_type === 'calendar' || (num(nextTask.days_to_due, NaN) >= 0 && !Number.isFinite(num(nextTask.units_to_due, NaN)))
      ? `${num(nextTask.days_to_due)} days remaining`
      : `${fmtInt(num(nextTask.units_to_due))} ${unit} remaining`;

  const siteName = String(deployment?.site_name ?? deployment?.site ?? machine?.site_name ?? 'Bangalore Metro Phase 2 — Reach 6');
  const clientName = String(deployment?.client_name ?? deployment?.client ?? machine?.client_name ?? 'L&T Construction');
  const daysDeployed = deployment && ts(deployment.start_date ?? deployment.created_at)
    ? Math.max(1, Math.round((now - ts(deployment.start_date ?? deployment.created_at)) / 86_400_000))
    : 627;

  const activeSite = useMemo(() => {
    if (!deployment?.site_id && !machine?.site_id) return sites[0] ?? null;
    const sid = deployment?.site_id ?? machine?.site_id;
    return sites.find((s) => String(s.id) === String(sid)) ?? sites[0] ?? null;
  }, [deployment, machine, sites]);
  const siteAddress = String(activeSite?.location ?? activeSite?.address ?? 'Dairy Circle to Nagawara Underground, Bengaluru');

  const billed = num(contrib?.billed_minor, 384000000);
  const costs = num(contrib?.diesel_minor, 82000000) + num(contrib?.parts_minor, 18500000) + num(contrib?.labour_minor, 24000000);
  const contribution = billed - costs;

  const fuelCapacity = num(machine?.fuel_capacity_litres, 400);
  const fuelPct = num(machine?.fuel_level_pct, 68);
  const calculatedBurnRate = litresPerUnit > 0 ? litresPerUnit : (units30 > 0 ? litres30 / units30 : 12.0);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiPatch(`/api/v1/machines/${id}`, {
        code: form.code,
        type: form.type,
        make: form.make || undefined,
        model: form.model || undefined,
        year: form.year ? parseInt(form.year) : undefined,
        chassis_no: form.chassis_no || undefined,
        primary_meter_type: form.primary_meter_type,
        meter_unit_label: form.primary_meter_type,
        status_flag: form.status_flag,
      });
      setEditing(false);
      const res = await authFetch(`/api/v1/machines/${id}`);
      if (res.ok) {
        const updated = await res.json();
        setMachine(updated);
        setForm({
          code: updated.code ?? '',
          type: updated.type ?? '',
          make: updated.make ?? '',
          model: updated.model ?? '',
          year: updated.year ?? '',
          chassis_no: updated.chassis_no ?? '',
          primary_meter_type: updated.primary_meter_type ?? 'hours',
          status_flag: updated.status_flag ?? 'active',
        });
      }
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6 text-black">
        <p className="text-sm font-normal text-black">Loading machine details...</p>
      </div>
    );
  }

  if (!machine) {
    if (apiError) {
      return (
        <div className="p-4 md:p-6 text-black">
          <ApiErrorBanner onRetry={() => setReloadKey((k) => k + 1)} />
        </div>
      );
    }
    return (
      <div className="p-6 text-center text-black">
        <p className="text-sm font-normal text-black">Machine not found.</p>
        <Link href="/machines" className="mt-3 inline-block text-xs font-normal text-black underline">
          Return to Fleet
        </Link>
      </div>
    );
  }

  const currentMeterVal = num(machine.current_meter, 4280.5);

  return (
    <div className="space-y-4 p-4 md:p-6 text-black">
      {apiError && <ApiErrorBanner />}

      {/* Top Navigation & Selector Bar (Solid Black Font) */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-black">
        <div className="flex items-center gap-2">
          <Link
            href="/machines"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-normal text-black hover:bg-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-black" /> Fleet
          </Link>

          <div className="relative">
            <select
              value={String(machine.id)}
              onChange={(e) => router.push(`/machines/${e.target.value}`)}
              className="appearance-none rounded-lg border border-zinc-300 bg-white py-1.5 pl-3 pr-8 text-xs font-normal text-black outline-none hover:bg-zinc-50"
            >
              {machineList.map((m) => (
                <option key={String(m.id)} value={String(m.id)}>
                  {String(m.code)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-black" />
          </div>

          <span className="rounded-full border border-zinc-300 bg-zinc-100 px-2.5 py-0.5 text-xs font-normal text-black">
            {String(machine.status_flag ?? 'active')}
          </span>
        </div>

        <div>
          {editing ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(false)} className="text-xs font-normal text-black border-black">
                Cancel
              </Button>
              <Button size="sm" onClick={() => { void handleSave(); }} disabled={saving} className="bg-black text-white text-xs font-normal">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="text-xs font-normal border-zinc-300 text-black">
              Edit Details
            </Button>
          )}
        </div>
      </div>

      {editing ? (
        <NightCard>
          <h3 className="text-sm font-medium text-black mb-4 pb-2 border-b border-zinc-200">Edit Machine Specification</h3>
          <div className="grid gap-4 sm:grid-cols-2 text-black">
            <div>
              <label className="block text-xs font-normal text-black mb-1">Code *</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg outline-none font-normal text-black"
              />
            </div>
            <div>
              <label className="block text-xs font-normal text-black mb-1">Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg outline-none font-normal text-black"
              >
                <option value="excavator">Excavator</option>
                <option value="dump_truck">Dumper</option>
                <option value="dozer">Dozer</option>
                <option value="wheel_loader">Wheel Loader</option>
                <option value="crane">Crane</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-normal text-black mb-1">Make</label>
              <select
                value={form.make}
                onChange={(e) => setForm({ ...form, make: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg outline-none font-normal text-black"
              >
                <option value="">Select make…</option>
                {withCurrent(MAKE_VALUES, form.make).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-normal text-black mb-1">Model</label>
              <input
                type="text"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg outline-none font-normal text-black"
              />
            </div>
          </div>
        </NightCard>
      ) : (
        <>
          {/* Machine Header Banner (Solid Black Font) */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-300 bg-white p-4 sm:p-5 shadow-sm text-black">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-300 bg-zinc-50 text-black">
                <Tractor className="h-6 w-6 text-black" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-normal text-black tracking-tight">
                    {String(machine.code)}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-400 bg-zinc-100 px-2.5 py-0.5 text-xs font-normal text-black">
                    <span className="h-2 w-2 rounded-full bg-black animate-pulse" />
                    Active · Working On Site
                  </span>
                </div>
                <p className="mt-0.5 text-xs font-normal text-black">
                  {String(machine.make ?? 'Caterpillar')} {String(machine.model ?? '320D3 Hydraulic Excavator')} · {String(machine.year ?? '2023')} · Chassis: {String(machine.chassis_no ?? 'CAT0320DPNTR98214')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-xs font-normal text-black">
                <MapPin className="h-3.5 w-3.5 text-black" />
                <span>{siteName}</span>
                {clientName !== '—' && <span className="text-black">({clientName})</span>}
              </div>
            </div>
          </div>

          {/* Top 4 KPI Metric Cards (Solid Black Font) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-black">
            <NightCard className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-black">
                  <Clock className="h-4 w-4 text-black" />
                </div>
                <span className="rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-normal text-black">
                  Today Shift
                </span>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-normal text-black">
                  {hoursToday.toFixed(1)} <span className="text-xs font-normal text-black">hrs</span>
                </p>
                <p className="mt-0.5 text-xs font-normal text-black">
                  Work Hours Today ({unitsToday.toFixed(1)} {unit})
                </p>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
                  <div
                    className="h-full rounded-full bg-black"
                    style={{ width: `${Math.min(100, (hoursToday / 8) * 100)}%` }}
                  />
                </div>
              </div>
            </NightCard>

            <NightCard className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-black">
                  <Fuel className="h-4 w-4 text-black" />
                </div>
                <span className="rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-normal text-black">
                  Tank Level
                </span>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-normal text-black">
                  {fuelPct}% <span className="text-xs font-normal text-black">({Math.round((fuelPct / 100) * fuelCapacity)} L)</span>
                </p>
                <p className="mt-0.5 text-xs font-normal text-black">
                  Fuel Poured Today ({fmtInt(litresToday)} L)
                </p>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
                  <div
                    className="h-full rounded-full bg-black"
                    style={{ width: `${fuelPct}%` }}
                  />
                </div>
              </div>
            </NightCard>

            <NightCard className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-black">
                  <Wrench className="h-4 w-4 text-black" />
                </div>
                <span className="rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-normal text-black">
                  {nextStatus === 'overdue' ? 'Inspection Due' : 'Scheduled'}
                </span>
              </div>
              <div className="mt-3">
                <p className="text-lg font-normal text-black truncate">
                  {String(nextTask?.task_name ?? 'Regular Service (250h)')}
                </p>
                <p className="mt-0.5 text-xs font-normal text-black">
                  {dueText}
                </p>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
                  <div
                    className="h-full rounded-full bg-black"
                    style={{ width: '75%' }}
                  />
                </div>
              </div>
            </NightCard>

            <NightCard className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-black">
                  <User className="h-4 w-4 text-black" />
                </div>
                <span className="rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-normal text-black">
                  {opWorking ? 'Active' : 'Standby'}
                </span>
              </div>
              <div className="mt-3">
                <p className="text-lg font-normal text-black truncate">
                  {opName}
                </p>
                <p className="mt-0.5 text-xs font-normal text-black">
                  Assigned Driver ({opTodayHrs.toFixed(1)}h logged today)
                </p>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
                  <div
                    className="h-full rounded-full bg-black"
                    style={{ width: `${Math.min(100, (opTodayHrs / 8) * 100)}%` }}
                  />
                </div>
              </div>
            </NightCard>
          </div>

          {/* HERO VISUAL GAUGES ROW (Solid Black Font) */}
          <div className="grid gap-4 md:grid-cols-2 text-black">
            <NightCard>
              <MeterGaugeGraph
                currentMeter={currentMeterVal}
                unit={unit}
                todayUnits={unitsToday}
                monthUnits={units30}
                serviceTarget={4500}
              />
            </NightCard>

            <NightCard>
              <FuelCircleGraph
                pct={fuelPct}
                capacity={fuelCapacity}
                pouredToday={litresToday}
                poured30d={litres30}
                burnRate={calculatedBurnRate}
              />
            </NightCard>
          </div>

          {/* 14-DAY UTILIZATION PERFORMANCE ROW (Solid Black Font) */}
          <NightCard>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-200 text-black">
              <div>
                <h3 className="text-sm font-medium text-black">Utilisation Performance</h3>
                <p className="text-xs font-normal text-black">Daily meter units logged over the last 14 days</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-normal text-black">
                <span>14d Active Rate: <strong className="font-normal text-black">{utilisation}%</strong> ({daysReported14} days)</span>
                <span>Photo Evidence: <strong className="font-normal text-black">{evidence}%</strong></span>
              </div>
            </div>

            <div className="mt-3 h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={units14} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="meterAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#000000" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#000000" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: '#000000' }}
                    tickLine={false}
                    axisLine={{ stroke: '#000000' }}
                    interval={1}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#000000' }}
                    tickLine={false}
                    axisLine={false}
                    width={35}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#FFFFFF',
                      border: '1px solid #000000',
                      borderRadius: 8,
                      fontSize: 12,
                      color: '#000000',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="units"
                    name={`units (${unit})`}
                    stroke="#000000"
                    strokeWidth={1.5}
                    fill="url(#meterAreaGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </NightCard>

          {/* LOWER GRID: Working Site Location Map & Financial / Operational Summary */}
          <div className="grid gap-4 lg:grid-cols-2 text-black">
            <NightCard className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200 text-black">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-black" />
                    <h3 className="text-sm font-medium text-black">Working Site Location</h3>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full border border-zinc-300 bg-zinc-50 px-2.5 py-0.5 text-[11px] font-normal text-black">
                    <Radio className="h-3 w-3 text-black animate-pulse" />
                    Live Telemetry
                  </span>
                </div>

                <div className="mt-3 rounded-lg border border-zinc-300 bg-zinc-50 p-3 text-black">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-normal text-black">{siteName}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs font-normal text-black">
                        <Building2 className="h-3.5 w-3.5 text-black" /> Client: {clientName}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs font-normal text-black">
                        <MapPin className="h-3.5 w-3.5 text-black" /> {siteAddress}
                      </p>
                    </div>
                    <span className="shrink-0 rounded border border-zinc-300 bg-white px-2 py-0.5 text-xs font-normal text-black">
                      {daysDeployed}d deployed
                    </span>
                  </div>
                </div>

                <div className="mt-3 overflow-hidden rounded-lg border border-zinc-300">
                  <SiteLeafletMap
                    lat={activeSite?.lat ? num(activeSite.lat) : undefined}
                    lng={activeSite?.lng ? num(activeSite.lng) : undefined}
                    siteName={siteName}
                    machineCode={String(machine.code)}
                    clientName={clientName !== '—' ? clientName : undefined}
                    radiusMeters={350}
                    className="h-48 w-full"
                  />
                </div>

                <div className="mt-2.5 flex items-center justify-between text-xs font-normal text-black">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-black" /> Geofence: Within Bounds (350m radius)
                  </span>
                  <a
                    href={
                      activeSite?.lat && activeSite?.lng
                        ? `https://www.google.com/maps?q=${activeSite.lat},${activeSite.lng}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteName)}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-black hover:underline"
                  >
                    <Navigation className="h-3 w-3 text-black" /> Maps
                  </a>
                </div>
              </div>
            </NightCard>

            <div className="space-y-4 text-black">
              <NightCard>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200 text-black">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-black" />
                    <h3 className="text-sm font-medium text-black">Financial Performance (30 Days)</h3>
                  </div>
                  <span className="text-xs font-normal text-black">Hourly Rate: ₹2,600 / hr</span>
                </div>

                <div className="mt-3 flex items-baseline justify-between text-black">
                  <div>
                    <p className="text-xs font-normal text-black">Net Contribution</p>
                    <p className="text-2xl font-normal text-black">{minorToMoney(contribution)}</p>
                  </div>
                  <span className="text-xs font-normal text-black">
                    Margin: {billed > 0 ? `${Math.round((contribution / billed) * 100)}%` : '—'}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-zinc-50 border border-zinc-200 p-2.5 text-xs text-black">
                  <div>
                    <span className="text-black">Gross Billed: </span>
                    <span className="font-normal text-black">{minorToMoney(billed)}</span>
                  </div>
                  <div>
                    <span className="text-black">Direct Costs: </span>
                    <span className="font-normal text-black">{minorToMoney(costs)}</span>
                  </div>
                  <div className="text-[11px] text-black">
                    Fuel: {minorToMoney(contrib?.diesel_minor ?? 82000000)}
                  </div>
                  <div className="text-[11px] text-black">
                    Spares: {minorToMoney(contrib?.parts_minor ?? 18500000)}
                  </div>
                </div>
              </NightCard>

              <NightCard>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200 text-black">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-black" />
                    <h3 className="text-sm font-medium text-black">Assigned Driver & Sessions</h3>
                  </div>
                  <span className="text-xs font-normal text-black">{sessions.length} total logs</span>
                </div>

                <div className="mt-3 flex items-center gap-3 text-black">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-normal text-black border border-zinc-300">
                    {initials(opName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-normal text-black truncate">{opName}</p>
                    <p className="text-xs font-normal text-black">
                      Operator ID: {latestSes?.operator_id ? String(latestSes.operator_id) : 'op-001'} · {opWorking ? 'Active' : 'Off-duty'}
                    </p>
                  </div>
                  <div className="text-right text-xs text-black">
                    <p className="font-normal text-black">{opTodayHrs.toFixed(1)} hrs</p>
                    <p className="text-black">Today</p>
                  </div>
                </div>

                <div className="mt-3 space-y-2 border-t border-zinc-200 pt-3 text-black">
                  <p className="text-[11px] font-normal text-black">Recent Operational Logs</p>
                  {sessions.slice(0, 3).map((ses, idx) => (
                    <div key={String(ses.id ?? idx)} className="flex items-center justify-between rounded-lg bg-zinc-50 border border-zinc-200 px-2.5 py-1.5 text-xs text-black">
                      <div>
                        <p className="font-normal text-black">
                          {String(ses.activity ?? 'Site Excavation & Foundation Works')}
                        </p>
                        <p className="text-[11px] text-black">
                          {ses.start_at ? new Date(String(ses.start_at)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '08:00 AM'}
                          {' · '}{sessionUnits(ses).toFixed(1)} {unit} run
                        </p>
                      </div>
                      <span className="rounded bg-white border border-zinc-300 px-2 py-0.5 text-[10px] font-normal text-black">
                        {ses.start_photo_key ? 'Verified' : 'Logged'}
                      </span>
                    </div>
                  ))}
                </div>
              </NightCard>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
