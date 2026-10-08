'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { authFetch } from '@/lib/api/auth-fetch';
import { fetchList, fetchListStrict } from '@/lib/api/fetch-list';
import { DonutChart } from '@/components/ui/donut-chart';
import {
  RadialOrbitalTimeline, formatTimelineDate, type TimelineItem,
} from '@/components/ui/radial-orbital-timeline';
import { cn } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  AlertTriangle, Brain, CalendarClock, Clock, Coins, Gauge, Power, Wrench,
  CheckCircle2,
} from 'lucide-react';
import { ApiErrorBanner } from '@/components/api-error-banner';
import { Spinner } from '@/components/ui/spinner';

/** Local calendar day as `YYYY-MM-DD`, for comparing date-only records. */
function localTodayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function sessionHours(s: Record<string, unknown>): number {
  const a = new Date(String(s.start_at ?? '')).getTime();
  const b = s.end_at ? new Date(String(s.end_at)).getTime() : Date.now();
  if (!a || !b || b < a) return 0;
  return Math.min((b - a) / 3_600_000, 24);
}

function fmtHours(h: number): string {
  return h < 10 ? h.toFixed(1) : Math.round(h).toLocaleString();
}

function fmtMoney(amount: number, currency = 'INR'): string {
  if (currency === 'INR') return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  return `$${Math.round(amount).toLocaleString()}`;
}

function healthColor(score: number): string {
  if (score >= 90) return 'text-black dark:text-white bg-slate-100 dark:bg-slate-800';
  if (score >= 70) return 'text-black dark:text-white bg-slate-100 dark:bg-slate-800';
  if (score >= 50) return 'text-black dark:text-white bg-slate-100 dark:bg-slate-800';
  return 'text-black dark:text-white bg-slate-100 dark:bg-slate-800';
}

interface MachineInsight {
  machine_code: string;
  machine_id: string;
  type: string;
  make: string;
  model: string;
  year: number;
  health_score: number;
  status: string;
  performance_summary: string;
  issues: string[];
  earnings_per_day: { date: string; hours: number; amount: number }[];
  earnings_total: { total: number; daily_average: number; monthly_estimate: number; currency: string };
  recommendations: string[];
  stats: {
    total_hours: number;
    billable_hours: number;
    billable_ratio: number;
    total_sessions: number;
    downtime_hours: number;
    downtime_events: number;
    fuel_litres: number;
    fuel_cost: number;
    avg_session_hours: number;
    days_since_last_session: number;
    current_meter: number;
    meter_unit: string;
  };
}

export default function Insights() {
  const [machines, setMachines] = useState<Record<string, unknown>[]>([]);
  const [sessions, setSessions] = useState<Record<string, unknown>[]>([]);
  const [insights, setInsights] = useState<MachineInsight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  // Drives the status donut: hovered/focused segment ↔ centre text ↔ legend.
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);
  // Maintenance history for the orbit — visits are scoped per machine by the API.
  const [maintenanceVisits, setMaintenanceVisits] = useState<Record<string, unknown>[]>([]);
  const [visitsLoading, setVisitsLoading] = useState(false);

  useEffect(() => {
    void Promise.all([
      fetchListStrict<Record<string, unknown>>('/api/v1/machines'),
      fetchListStrict<Record<string, unknown>>('/api/v1/work-sessions'),
    ]).then(([m, s]) => {
      // API up → show exactly what's in the DB (empty = empty state)
      setMachines(m);
      setSessions(s);
    }).catch(() => setApiError(true)).finally(() => setLoading(false));
  }, []);

  // Flatten recent maintenance visits across the fleet (newest first).
  useEffect(() => {
    if (loading || machines.length === 0) return;
    setVisitsLoading(true);
    void Promise.all(
      machines
        .filter((m) => typeof m.id === 'string' && m.id)
        .map((m) =>
          fetchList<Record<string, unknown>>(`/api/v1/maintenance/machines/${String(m.id)}/visits`)
            .then((rows) =>
              rows.map(
                (v): Record<string, unknown> => ({ ...v, machine_code: String(m.code ?? 'Machine') }),
              ),
            )
            .catch(() => []),
        ),
    )
      .then((groups) =>
        setMaintenanceVisits(
          groups
            .flat()
            .filter((v) => typeof v.visit_date === 'string' && v.visit_date)
            .sort((a, b) => String(b.visit_date).localeCompare(String(a.visit_date)))
            .slice(0, 7),
        ),
      )
      .finally(() => setVisitsLoading(false));
  }, [loading, machines]);

  // Fetch computed insights
  useEffect(() => {
    if (loading || machines.length === 0) return;
    setInsightsLoading(true);
    authFetch('/api/v1/insights/ai')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load insights');
        const data = await res.json();
        // API up → show exactly what it returns (empty = empty state)
        setInsights(data.insights ?? []);
      })
      .catch(() => setApiError(true))
      .finally(() => setInsightsLoading(false));
  }, [loading, machines]);

  // Fleet totals from raw data
  const totalHours = useMemo(() =>
    sessions.reduce((sum, s) => sum + sessionHours(s), 0), [sessions]);
  const activeMachines = machines.filter((m) => m.status_flag !== 'retired');

  // Fleet totals from insights
  const fleetMonthlyEarnings = insights.reduce((s, i) => s + i.earnings_total.monthly_estimate, 0);
  const avgHealth = insights.length > 0
    ? Math.round(insights.reduce((s, i) => s + i.health_score, 0) / insights.length)
    : 0;
  const totalDowntime = insights.reduce((s, i) => s + i.stats.downtime_hours, 0);

  // Charts
  const hoursChartData = insights
    .filter((i) => i.stats.total_hours > 0)
    .map((i) => ({
      name: i.machine_code,
      hours: i.stats.total_hours,
      billable: i.stats.billable_hours,
    }));

  const utilPieData = [
    { 
      name: 'Operating', 
      value: insights.filter((i) => i.status === 'operating').length, 
      color: '#22C55E',
      machines: insights.filter((i) => i.status === 'operating').map((i) => i.machine_code)
    },
    { 
      name: 'Under Maintenance', 
      value: insights.filter((i) => i.status === 'downtime').length, 
      color: '#F59E0B',
      machines: insights.filter((i) => i.status === 'downtime').map((i) => i.machine_code)
    },
    { 
      name: 'Idle', 
      value: insights.filter((i) => i.status === 'idle').length, 
      color: '#6B7280',
      machines: insights.filter((i) => i.status === 'idle').map((i) => i.machine_code)
    },
  ].filter((d) => d.value > 0);

  const activeStatus = utilPieData.find((d) => d.name === hoveredStatus) ?? null;
  const statusTotal = utilPieData.reduce((sum, d) => sum + d.value, 0);
  const displayedValue = activeStatus ? activeStatus.value : statusTotal;
  const displayedPct =
    activeStatus && statusTotal > 0 ? Math.round((activeStatus.value / statusTotal) * 100) : 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20">
        <Spinner className="h-5 w-5" />
        <p className="text-muted-foreground">Loading fleet insights...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {apiError && <ApiErrorBanner />}
      <div>
        <h1 className="text-3xl font-normal tracking-tight text-black">Fleet Insights</h1>
        <p className="text-sm font-normal text-black mt-1">
          Performance overview computed from driver work sessions, fuel telemetry, and equipment downtime
        </p>
      </div>

      {/* ── Fleet Overview: Small Boxes with Images Inside & Unbolded Black Font ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {/* Box 1: Total Machines */}
        <div className="rounded-xl border border-zinc-300 bg-white p-3.5 shadow-sm hover:border-black transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-normal uppercase tracking-wider text-black">Total Machines</span>
            <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-zinc-300 shrink-0 bg-zinc-100">
              <img src="/fleet/exc-01.jpg" alt="Machines" className="w-full h-full object-cover" />
            </div>
          </div>
          <p className="mt-2 text-xl font-normal tracking-tight text-black">{machines.length}</p>
        </div>

        {/* Box 2: Active Machines */}
        <div className="rounded-xl border border-zinc-300 bg-white p-3.5 shadow-sm hover:border-black transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-normal uppercase tracking-wider text-black">Active Machines</span>
            <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-zinc-300 shrink-0 bg-zinc-100">
              <img src="/fleet/exc-02.jpg" alt="Active" className="w-full h-full object-cover" />
              <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>
          </div>
          <p className="mt-2 text-xl font-normal tracking-tight text-black">{activeMachines.length}</p>
        </div>

        {/* Box 3: Total Hours Run */}
        <div className="rounded-xl border border-zinc-300 bg-white p-3.5 shadow-sm hover:border-black transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-normal uppercase tracking-wider text-black">Hours Run</span>
            <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-zinc-300 shrink-0 bg-zinc-100">
              <img src="/fleet/dzr-01.jpg" alt="Hours" className="w-full h-full object-cover" />
            </div>
          </div>
          <p className="mt-2 text-xl font-normal tracking-tight text-black">{fmtHours(totalHours)}</p>
        </div>

        {/* Box 4: Downtime Hours */}
        <div className="rounded-xl border border-zinc-300 bg-white p-3.5 shadow-sm hover:border-black transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-normal uppercase tracking-wider text-black">Downtime</span>
            <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-zinc-300 shrink-0 bg-zinc-100">
              <img src="/fleet/dtr-01.jpg" alt="Downtime" className="w-full h-full object-cover" />
            </div>
          </div>
          <p className="mt-2 text-xl font-normal tracking-tight text-black">{fmtHours(totalDowntime)}</p>
        </div>

        {/* Box 5: Est. Monthly Revenue */}
        <div className="rounded-xl border border-zinc-300 bg-white p-3.5 shadow-sm hover:border-black transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-normal uppercase tracking-wider text-black">Est. Revenue</span>
            <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-zinc-300 shrink-0 bg-zinc-100">
              <img src="/fleet/dtr-02.jpg" alt="Revenue" className="w-full h-full object-cover" />
            </div>
          </div>
          <p className="mt-2 text-xl font-normal tracking-tight text-black truncate">{fmtMoney(fleetMonthlyEarnings)}</p>
        </div>

        {/* Box 6: Fleet Health Score */}
        <div className="rounded-xl border border-zinc-300 bg-white p-3.5 shadow-sm hover:border-black transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-normal uppercase tracking-wider text-black">Fleet Health</span>
            <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-zinc-300 shrink-0 bg-zinc-100">
              <img src="/operators/op-001.jpg" alt="Health" className="w-full h-full object-cover object-top" />
            </div>
          </div>
          <p className="mt-2 text-xl font-normal tracking-tight text-black">{avgHealth}%</p>
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden rounded-2xl border border-solid border-zinc-300 bg-white p-0 shadow-none">
          <div className="flex flex-col gap-1 border-b border-solid border-zinc-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-black" />
              <CardTitle className="text-base font-normal text-black">Hours per Machine</CardTitle>
            </div>
            <p className="text-xs font-normal text-black">
              Total operating hours vs billable hours for each machine.
            </p>
          </div>
          <CardContent className="pt-6">
            {hoursChartData.length === 0 ? (
              <p className="text-black text-center py-8 font-normal">No sessions recorded yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={hoursChartData} layout="vertical" margin={{ left: 10 }}>
                  <defs>
                    <linearGradient id="totalGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#18181B" />
                      <stop offset="100%" stopColor="#3F3F46" />
                    </linearGradient>
                    <linearGradient id="billableGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#71717A" />
                      <stop offset="100%" stopColor="#A1A1AA" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={70} stroke="#9CA3AF" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                            <p className="font-semibold text-gray-800 mb-2">{payload[0]?.payload?.name}</p>
                            {payload.map((entry, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: entry.name === 'Total Hours' ? '#8B5CF6' : '#10B981' }}
                                />
                                <span className="text-gray-600">{entry.name}:</span>
                                <span className="font-medium">{entry.value}h</span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="hours" fill="url(#totalGradient)" radius={[0, 6, 6, 0]} name="Total Hours" />
                  <Bar dataKey="billable" fill="url(#billableGradient)" radius={[0, 6, 6, 0]} name="Billable Hours" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-xl border border-zinc-300 bg-white shadow-none">
          <div className="flex items-center gap-2 border-b border-zinc-200 px-5 py-3">
            <Power className="h-4 w-4 text-black" />
            <CardTitle className="text-sm font-normal text-black">Machine Status Today</CardTitle>
          </div>
          <CardContent className="pt-6">
            {utilPieData.length === 0 ? (
              <p className="text-black text-center py-8 text-sm font-normal">No machines</p>
            ) : (
              <div className="flex flex-col items-center space-y-5">
                <DonutChart
                  data={utilPieData.map((d) => ({
                    value: d.value,
                    color: d.color,
                    label: d.name,
                  }))}
                  size={220}
                  strokeWidth={26}
                  animationDuration={1.1}
                  animationDelayPerSegment={0.12}
                  highlightOnHover
                  onSegmentHover={(segment) => setHoveredStatus(segment?.label ?? null)}
                  centerContent={
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeStatus?.name ?? 'total'}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2, ease: 'circOut' }}
                        className="flex flex-col items-center justify-center text-center"
                      >
                        <p className="text-black text-xs font-normal truncate max-w-[150px]">
                          {activeStatus ? activeStatus.name : 'Total Machines'}
                        </p>
                        <p className="text-4xl font-normal text-black">{displayedValue}</p>
                        {activeStatus && (
                          <p className="text-xs font-normal text-black">
                            {displayedPct}% of fleet
                          </p>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  }
                />

                {/* Legend rows mirror the chart and stay keyboard-reachable. */}
                <div className="w-full space-y-1 border-t border-zinc-200 pt-3">
                  {utilPieData.map((entry) => (
                    <button
                      key={entry.name}
                      type="button"
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition-colors border border-transparent',
                        hoveredStatus === entry.name ? 'bg-zinc-100 border-zinc-300' : 'hover:bg-zinc-50',
                      )}
                      onMouseEnter={() => setHoveredStatus(entry.name)}
                      onMouseLeave={() => setHoveredStatus(null)}
                      onFocus={() => setHoveredStatus(entry.name)}
                      onBlur={() => setHoveredStatus(null)}
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-xs font-normal text-black">{entry.name}</span>
                      </span>
                      <span className="text-xs font-normal text-black">
                        {entry.value}
                      </span>
                    </button>
                  ))}
                  {activeStatus && activeStatus.machines.length > 0 && (
                    <div className="flex flex-wrap gap-1 px-2 pt-1">
                      {activeStatus.machines.map((code) => (
                        <span
                          key={code}
                          className="rounded border border-zinc-300 bg-zinc-50 px-1.5 py-0.5 text-xs font-normal text-black"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Maintenance timeline ── */}
      {!loading && !apiError && (visitsLoading ? (
        <p className="text-center text-sm font-normal text-black">
          Loading maintenance history…
        </p>
      ) : maintenanceVisits.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-black" />
            <h2 className="text-lg font-normal text-black">Maintenance timeline</h2>
          </div>
          <p className="text-xs font-normal text-black">
            The most recent service visits across the fleet — select a node for the visit details.
          </p>
          <RadialOrbitalTimeline
            hubLabel="Visits"
            timelineData={maintenanceVisits.map((visit, index, all): TimelineItem => {
              const iso = String(visit.visit_date);
              const isFuture = iso > localTodayIso();
              const code = String(visit.machine_code);
              const details = [
                visit.mechanic ? `Mechanic: ${String(visit.mechanic)}` : null,
                visit.meter_at_visit != null ? `Meter: ${String(visit.meter_at_visit)}` : null,
                visit.notes ? String(visit.notes).slice(0, 120) : null,
              ].filter(Boolean);
              return {
                id: index,
                title: code,
                date: formatTimelineDate(iso),
                category: visit.visit_type ? String(visit.visit_type) : 'Maintenance',
                content: details.join(' · ') || `Service visit recorded for ${code}.`,
                icon: isFuture ? CalendarClock : Wrench,
                relatedIds: [index - 1, index + 1].filter((i) => i >= 0 && i < all.length),
                status: isFuture ? 'pending' : 'completed',
                statusLabel: isFuture ? 'Scheduled' : 'Completed',
              };
            })}
          />
        </div>
      ) : null)}

      {/* ── Per-Vehicle Report ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-black" />
          <h2 className="text-lg font-normal text-black">Per-Vehicle Report</h2>
        </div>

        {insightsLoading && (
          <Card className="border border-zinc-300 bg-white">
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-3">
                <Spinner className="h-6 w-6 text-black" />
                <p className="text-sm font-normal text-black">Computing vehicle insights...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!insightsLoading && insights.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {insights.map((ins) => {
              const machineImg = ins.machine_code.toLowerCase().includes('exc-02')
                ? '/fleet/exc-02.jpg'
                : ins.machine_code.toLowerCase().includes('dzr')
                ? '/fleet/dzr-01.jpg'
                : ins.machine_code.toLowerCase().includes('dtr-02')
                ? '/fleet/dtr-02.jpg'
                : ins.machine_code.toLowerCase().includes('dtr')
                ? '/fleet/dtr-01.jpg'
                : '/fleet/exc-01.jpg';

              return (
                <Card key={ins.machine_code} className="overflow-hidden rounded-xl border border-zinc-300 bg-white p-0 shadow-none hover:border-black transition-colors">
                  <CardContent className="p-4 space-y-3">
                    {/* Header with image */}
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg border border-zinc-300 overflow-hidden bg-zinc-100 shrink-0">
                        <img
                          src={machineImg}
                          alt={ins.machine_code}
                          className="h-full w-full object-cover grayscale contrast-125"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-normal text-black truncate">{ins.machine_code}</h3>
                          <span className="rounded border border-zinc-300 bg-zinc-50 px-2 py-0.5 text-xs font-normal text-black">
                            {ins.health_score}%
                          </span>
                        </div>
                        <p className="text-xs font-normal text-black truncate">
                          {ins.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </p>
                      </div>
                    </div>

                    {/* Key Stats - One Line */}
                    <div className="flex items-center gap-3 text-xs font-normal text-black border-y border-zinc-200 py-2">
                      <span className="flex items-center gap-1 text-black font-normal">
                        <Clock className="h-3 w-3 text-black" />
                        {ins.stats.total_hours}h
                      </span>
                      <span className="flex items-center gap-1 text-black font-normal">
                        <CheckCircle2 className="h-3 w-3 text-black" />
                        {ins.stats.billable_ratio}%
                      </span>
                      {ins.stats.downtime_hours > 0 && (
                        <span className="flex items-center gap-1 text-black font-normal">
                          <Wrench className="h-3 w-3 text-black" />
                          {ins.stats.downtime_hours}h down
                        </span>
                      )}
                    </div>

                    {/* Earnings - Compact */}
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <p className="text-[11px] font-normal text-black">Monthly Est.</p>
                        <p className="text-sm font-normal text-black">
                          {fmtMoney(ins.earnings_total.monthly_estimate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-normal text-black">Daily Avg</p>
                        <p className="text-sm font-normal text-black">{fmtMoney(ins.earnings_total.daily_average)}</p>
                      </div>
                    </div>

                    {/* Issues - Only if any */}
                    {ins.issues.length > 0 && (
                      <div className="rounded border border-zinc-300 p-2 bg-zinc-50 space-y-1">
                        {ins.issues.map((issue, i) => (
                          <p key={i} className="text-xs font-normal text-black flex items-center gap-1.5">
                            <AlertTriangle className="h-3 w-3 text-black shrink-0" />
                            <span className="truncate">{issue}</span>
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Action */}
                    <a
                      href={`/machines/${ins.machine_id}`}
                      className="block text-center text-xs font-normal text-black hover:bg-zinc-100 py-1.5 border border-zinc-300 rounded-lg transition-colors"
                    >
                      View Machine Details →
                    </a>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!insightsLoading && insights.length === 0 && (
          <Card className="border border-zinc-300 bg-white">
            <CardContent className="py-12 text-center">
              <p className="text-sm font-normal text-black">No machine data available.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
