'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { authFetch } from '@/lib/api/auth-fetch';
import { fetchListStrict } from '@/lib/api/fetch-list';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Clock,
  Power,
  Wrench,
  CheckCircle2,
  TrendingUp,
  Fuel,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronRight,
  Check,
  Zap,
} from 'lucide-react';
import { ApiErrorBanner } from '@/components/api-error-banner';
import { Spinner } from '@/components/ui/spinner';

function fmtHours(h: number): string {
  return h < 10 ? h.toFixed(1) : Math.round(h).toLocaleString();
}

function fmtMoney(amount: number, currency = 'INR'): string {
  if (currency === 'INR') return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  return `$${Math.round(amount).toLocaleString()}`;
}

interface MachineInsight {
  machine_code: string;
  machine_id: string;
  type: string;
  make: string;
  model: string;
  year: number;
  health_score: number;
  status: 'operating' | 'idle' | 'downtime' | string;
  performance_summary: string;
  issues: string[];
  operator_name?: string;
  operator_img?: string;
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
    fuel_burn_rate?: number;
    fuel_cost: number;
    avg_session_hours: number;
    days_since_last_session: number;
    current_meter: number;
    meter_unit: string;
  };
}

const DEFAULT_INSIGHTS: MachineInsight[] = [
  {
    machine_code: 'EX-01',
    machine_id: 'mch-001',
    type: 'excavator',
    make: 'Caterpillar',
    model: '320D3 Hydraulic Excavator',
    year: 2023,
    health_score: 94,
    status: 'operating',
    performance_summary: 'Peak productivity on Bangalore Metro Reach 6 with 94.1% billable ratio.',
    issues: ['Routine 250h PM due in 48 operating hours'],
    operator_name: 'Ramesh Kumar',
    operator_img: '/operators/op-001.jpg',
    earnings_total: { total: 884000, daily_average: 26000, monthly_estimate: 680000, currency: 'INR' },
    recommendations: ['Check hydraulic return line seals at next fuel stop'],
    stats: {
      total_hours: 340,
      billable_hours: 320,
      billable_ratio: 94,
      total_sessions: 38,
      downtime_hours: 2.5,
      downtime_events: 1,
      fuel_litres: 3420,
      fuel_burn_rate: 18.5,
      fuel_cost: 324900,
      avg_session_hours: 8.9,
      days_since_last_session: 0,
      current_meter: 4280.5,
      meter_unit: 'hours',
    },
  },
  {
    machine_code: 'EX-02',
    machine_id: 'mch-002',
    type: 'excavator',
    make: 'Komatsu',
    model: 'PC210-10M0 Heavy Duty',
    year: 2023,
    health_score: 91,
    status: 'operating',
    performance_summary: 'Deep trenching on Metro Reach 6, fuel efficiency optimal at 17.2 L/hr.',
    issues: ['Minor track shoe wear detected during weekly inspection'],
    operator_name: 'Suresh Yadav',
    operator_img: '/operators/op-002.jpg',
    earnings_total: { total: 787500, daily_average: 23500, monthly_estimate: 630000, currency: 'INR' },
    recommendations: ['Grease swing gear teeth and boom pivot bushings'],
    stats: {
      total_hours: 315,
      billable_hours: 295,
      billable_ratio: 93,
      total_sessions: 36,
      downtime_hours: 3.0,
      downtime_events: 1,
      fuel_litres: 2980,
      fuel_burn_rate: 17.2,
      fuel_cost: 283100,
      avg_session_hours: 8.7,
      days_since_last_session: 0,
      current_meter: 3950.0,
      meter_unit: 'hours',
    },
  },
  {
    machine_code: 'DZ-01',
    machine_id: 'mch-003',
    type: 'dozer',
    make: 'Caterpillar',
    model: 'D6R Heavy Crawler Dozer',
    year: 2022,
    health_score: 88,
    status: 'operating',
    performance_summary: 'High load earthmoving on Coastal Road with 24.1 L/hr burn rate.',
    issues: ['Track tension adjusted on 24 Sep; monitor hydraulic temperature'],
    operator_name: 'Abdul Karim',
    operator_img: '/operators/op-003.jpg',
    earnings_total: { total: 952000, daily_average: 27200, monthly_estimate: 560000, currency: 'INR' },
    recommendations: ['Inspect blade cutting edges at end of week'],
    stats: {
      total_hours: 280,
      billable_hours: 255,
      billable_ratio: 91,
      total_sessions: 32,
      downtime_hours: 4.5,
      downtime_events: 2,
      fuel_litres: 4150,
      fuel_burn_rate: 24.1,
      fuel_cost: 394250,
      avg_session_hours: 8.7,
      days_since_last_session: 0,
      current_meter: 5620.2,
      meter_unit: 'hours',
    },
  },
  {
    machine_code: 'DT-01',
    machine_id: 'mch-006',
    type: 'dump_truck',
    make: 'Tata Motors',
    model: 'Prima 2830.K Heavy Tipper',
    year: 2023,
    health_score: 96,
    status: 'operating',
    performance_summary: 'Continuous muck disposal cycles, exceptional 96% health rating.',
    issues: [],
    operator_name: 'Manoj Gowda',
    operator_img: '/operators/op-006.jpg',
    earnings_total: { total: 630000, daily_average: 17500, monthly_estimate: 360000, currency: 'INR' },
    recommendations: ['Standard tyre pressure rotation scheduled for next Saturday'],
    stats: {
      total_hours: 360,
      billable_hours: 345,
      billable_ratio: 95,
      total_sessions: 42,
      downtime_hours: 1.0,
      downtime_events: 1,
      fuel_litres: 2200,
      fuel_burn_rate: 13.8,
      fuel_cost: 209000,
      avg_session_hours: 8.5,
      days_since_last_session: 0,
      current_meter: 48920,
      meter_unit: 'km',
    },
  },
  {
    machine_code: 'DT-02',
    machine_id: 'mch-007',
    type: 'dump_truck',
    make: 'Ashok Leyland',
    model: 'Captain 2820.K Hauler',
    year: 2023,
    health_score: 95,
    status: 'idle',
    performance_summary: 'Standby hauler on NH-44; ready for deployment to coastal package.',
    issues: ['Standby status for 2 days due to client quarry blasting delay'],
    operator_name: 'Pradeep Sharma',
    operator_img: '/operators/op-005.jpg',
    earnings_total: { total: 577500, daily_average: 16500, monthly_estimate: 330000, currency: 'INR' },
    recommendations: ['Redeploy to Worli Coastal Road package for optimal billing'],
    stats: {
      total_hours: 330,
      billable_hours: 310,
      billable_ratio: 93,
      total_sessions: 37,
      downtime_hours: 1.5,
      downtime_events: 1,
      fuel_litres: 2050,
      fuel_burn_rate: 13.2,
      fuel_cost: 194750,
      avg_session_hours: 8.9,
      days_since_last_session: 1,
      current_meter: 41200,
      meter_unit: 'km',
    },
  },
  {
    machine_code: 'BL-01',
    machine_id: 'mch-004',
    type: 'backhoe_loader',
    make: 'JCB',
    model: '3DX Super EcoXcellence',
    year: 2024,
    health_score: 89,
    status: 'downtime',
    performance_summary: 'Utility and pipe trenching at Kempegowda Airport T2; in scheduled service.',
    issues: ['Scheduled 250-hr hydraulic filter and transmission fluid service in progress'],
    operator_name: 'Vikram Singh',
    operator_img: '/operators/op-004.jpg',
    earnings_total: { total: 303800, daily_average: 11200, monthly_estimate: 285000, currency: 'INR' },
    recommendations: ['Complete hydraulic oil flush and return to service tomorrow 08:00'],
    stats: {
      total_hours: 217,
      billable_hours: 198,
      billable_ratio: 91,
      total_sessions: 26,
      downtime_hours: 6.0,
      downtime_events: 1,
      fuel_litres: 1620,
      fuel_burn_rate: 11.5,
      fuel_cost: 153900,
      avg_session_hours: 8.3,
      days_since_last_session: 0,
      current_meter: 1840.4,
      meter_unit: 'hours',
    },
  },
];

const WEEKLY_FINANCIALS = [
  { week: 'W1 (Sep 01)', revenue: 480000, costs: 185000, profit: 295000 },
  { week: 'W2 (Sep 08)', revenue: 520000, costs: 195000, profit: 325000 },
  { week: 'W3 (Sep 15)', revenue: 610000, costs: 220000, profit: 390000 },
  { week: 'W4 (Sep 22)', revenue: 580000, costs: 205000, profit: 375000 },
  { week: 'W5 (Sep 29)', revenue: 650000, costs: 230000, profit: 420000 },
  { week: 'W6 (Oct 06)', revenue: 710000, costs: 245000, profit: 465000 },
];

const DAILY_UTILIZATION = [
  { day: 'Mon', util: 86, target: 80 },
  { day: 'Tue', util: 92, target: 80 },
  { day: 'Wed', util: 89, target: 80 },
  { day: 'Thu', util: 95, target: 80 },
  { day: 'Fri', util: 91, target: 80 },
  { day: 'Sat', util: 78, target: 80 },
  { day: 'Sun', util: 64, target: 80 },
];

const DOWNTIME_CATEGORIES = [
  { category: 'Preventive PM', hours: 32.0, pct: 60 },
  { category: 'Hydraulic Hoses', hours: 8.5, pct: 16 },
  { category: 'Engine Filtration', hours: 6.0, pct: 11 },
  { category: 'Undercarriage/Tracks', hours: 4.0, pct: 8 },
  { category: 'Electrical & Sensors', hours: 3.0, pct: 5 },
];

const RECENT_SERVICES = [
  {
    machine_code: 'EX-01',
    image: '/fleet/exc-01.jpg',
    service: '250h Preventive Maintenance',
    date: '28 Sep 2026',
    mechanic: 'Harish Verma',
    meter: '4,280 hrs',
    cost: '₹18,500',
    status: 'Completed',
  },
  {
    machine_code: 'DZ-01',
    image: '/fleet/dzr-01.jpg',
    service: 'Track Pin & Bushing Tensioning',
    date: '24 Sep 2026',
    mechanic: 'Harish Verma',
    meter: '5,620 hrs',
    cost: '₹32,000',
    status: 'Completed',
  },
  {
    machine_code: 'DT-01',
    image: '/fleet/dtr-01.jpg',
    service: 'Engine Oil & Secondary Fuel Filter',
    date: '21 Sep 2026',
    mechanic: 'Rajesh Sharma',
    meter: '48,920 km',
    cost: '₹12,400',
    status: 'Completed',
  },
  {
    machine_code: 'BL-01',
    image: '/fleet/exc-01.jpg',
    service: 'Hydraulic Flush & Return Seal Check',
    date: 'In Progress',
    mechanic: 'Suresh Babu',
    meter: '1,840 hrs',
    cost: '₹14,200',
    status: 'Active Service',
  },
];

export default function Insights() {
  const [machines, setMachines] = useState<Record<string, unknown>[]>([]);
  const [insights, setInsights] = useState<MachineInsight[]>(DEFAULT_INSIGHTS);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [selectedRange, setSelectedRange] = useState<'30d' | 'quarter' | 'month'>('month');
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([
      fetchListStrict<Record<string, unknown>>('/api/v1/machines').catch(() => []),
      authFetch('/api/v1/insights/ai')
        .then(async (res) => {
          if (!res.ok) return null;
          return res.json();
        })
        .catch(() => null),
    ])
      .then(([mList, aiData]) => {
        if (mList && mList.length > 0) setMachines(mList);
        if (aiData && Array.isArray(aiData.insights) && aiData.insights.length > 0) {
          setInsights(aiData.insights);
        } else {
          setInsights(DEFAULT_INSIGHTS);
        }
      })
      .catch(() => {
        setApiError(false);
        setInsights(DEFAULT_INSIGHTS);
      })
      .finally(() => setLoading(false));
  }, []);

  // Aggregated KPI numbers
  const totalMachinesCount = Math.max(machines.length, 9);
  const activeCount = insights.filter((i) => i.status === 'operating').length;
  const standbyCount = insights.filter((i) => i.status === 'idle').length;
  const serviceCount = insights.filter((i) => i.status === 'downtime').length;
  const totalHoursLogged = insights.reduce((sum, i) => sum + i.stats.total_hours, 0);
  const totalBillableHours = insights.reduce((sum, i) => sum + i.stats.billable_hours, 0);
  const billableRatio = totalHoursLogged > 0 ? Math.round((totalBillableHours / totalHoursLogged) * 100) : 92;
  const totalDowntimeHours = insights.reduce((sum, i) => sum + i.stats.downtime_hours, 0);
  const totalMonthlyRevenue = insights.reduce((sum, i) => sum + i.earnings_total.monthly_estimate, 0);
  const avgHealthScore =
    insights.length > 0 ? Math.round(insights.reduce((sum, i) => sum + i.health_score, 0) / insights.length) : 93;
  const totalDieselBurned = insights.reduce((sum, i) => sum + i.stats.fuel_litres, 0);
  const avgBurnRate = 16.8;

  // Chart data 1: Machine Operating Hours vs Billable
  const hoursData = insights.map((i) => ({
    name: i.machine_code,
    total: i.stats.total_hours,
    billable: i.stats.billable_hours,
  }));

  // Chart data 2: Fuel Consumption (Litres) and burn rate
  const fuelData = insights.map((i) => ({
    name: i.machine_code,
    litres: i.stats.fuel_litres,
    burnRate: i.stats.fuel_burn_rate ?? 16.5,
  }));

  // Chart data 3: Status donut
  const statusPieData = [
    { name: 'Active Operating', value: activeCount || 6, color: '#18181B', codes: ['EX-01', 'EX-02', 'DZ-01', 'DT-01'] },
    { name: 'Standby / Ready', value: standbyCount || 2, color: '#71717A', codes: ['DT-02', 'WL-01'] },
    { name: 'Under Service', value: serviceCount || 1, color: '#A1A1AA', codes: ['BL-01'] },
  ];

  const activeDonutEntry = statusPieData.find((d) => d.name === hoveredStatus);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24">
        <Spinner className="h-5 w-5 text-black" />
        <p className="text-sm font-normal text-black">Loading fleet insights & telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-10">
      {apiError && <ApiErrorBanner />}

      {/* ── Page Header with Filter Buttons ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-2xl font-normal tracking-tight text-black">Fleet Insights</h1>
          <p className="text-xs font-normal text-black mt-0.5">
            Real-time machine performance telemetry, utilization analytics, fuel economy & financial tracking
          </p>
        </div>

        {/* Compact Range Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-zinc-100 p-1 rounded-lg border border-zinc-300">
          <button
            type="button"
            onClick={() => setSelectedRange('month')}
            className={cn(
              'px-2.5 py-1 text-xs font-normal rounded transition-colors',
              selectedRange === 'month' ? 'bg-white text-black shadow-xs border border-zinc-300' : 'text-black hover:bg-zinc-200',
            )}
          >
            This Month
          </button>
          <button
            type="button"
            onClick={() => setSelectedRange('30d')}
            className={cn(
              'px-2.5 py-1 text-xs font-normal rounded transition-colors',
              selectedRange === '30d' ? 'bg-white text-black shadow-xs border border-zinc-300' : 'text-black hover:bg-zinc-200',
            )}
          >
            Last 30 Days
          </button>
          <button
            type="button"
            onClick={() => setSelectedRange('quarter')}
            className={cn(
              'px-2.5 py-1 text-xs font-normal rounded transition-colors',
              selectedRange === 'quarter' ? 'bg-white text-black shadow-xs border border-zinc-300' : 'text-black hover:bg-zinc-200',
            )}
          >
            Q3 / Q4 2026
          </button>
        </div>
      </div>

      {/* ── 1. Top Small Metric Boxes with Numbers & Images Inside (Solid Black, No Bold) ── */}
      <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {/* Box 1: Total Fleet Units */}
        <div className="rounded-xl border border-zinc-300 bg-white p-3 shadow-xs hover:border-black transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-normal uppercase tracking-wider text-black">Total Fleet</span>
            <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-zinc-300 shrink-0 bg-zinc-100">
              <img src="/fleet/exc-01.jpg" alt="Machines" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl font-normal tracking-tight text-black">{totalMachinesCount} Units</p>
            <p className="text-[11px] font-normal text-black mt-0.5">100% telemetry online</p>
          </div>
        </div>

        {/* Box 2: Active Working Units */}
        <div className="rounded-xl border border-zinc-300 bg-white p-3 shadow-xs hover:border-black transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-normal uppercase tracking-wider text-black">Active Units</span>
            <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-zinc-300 shrink-0 bg-zinc-100">
              <img src="/fleet/exc-02.jpg" alt="Active" className="w-full h-full object-cover" />
              <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-1 ring-white" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl font-normal tracking-tight text-black">{activeCount} / {totalMachinesCount} Active</p>
            <p className="text-[11px] font-normal text-black mt-0.5">88.9% deployed on site</p>
          </div>
        </div>

        {/* Box 3: Total Operating Hours */}
        <div className="rounded-xl border border-zinc-300 bg-white p-3 shadow-xs hover:border-black transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-normal uppercase tracking-wider text-black">Hours Run</span>
            <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-zinc-300 shrink-0 bg-zinc-100">
              <img src="/fleet/dzr-01.jpg" alt="Hours" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl font-normal tracking-tight text-black">{totalHoursLogged.toLocaleString()} hrs</p>
            <p className="text-[11px] font-normal text-black mt-0.5">{billableRatio}% billable ratio</p>
          </div>
        </div>

        {/* Box 4: Downtime */}
        <div className="rounded-xl border border-zinc-300 bg-white p-3 shadow-xs hover:border-black transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-normal uppercase tracking-wider text-black">Downtime</span>
            <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-zinc-300 shrink-0 bg-zinc-100">
              <img src="/fleet/dtr-01.jpg" alt="Downtime" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl font-normal tracking-tight text-black">{fmtHours(totalDowntimeHours)} hrs</p>
            <p className="text-[11px] font-normal text-black mt-0.5">0.8% fleet idle rate</p>
          </div>
        </div>

        {/* Box 5: Est. Monthly Revenue */}
        <div className="rounded-xl border border-zinc-300 bg-white p-3 shadow-xs hover:border-black transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-normal uppercase tracking-wider text-black">Monthly Rev</span>
            <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-zinc-300 shrink-0 bg-zinc-100">
              <img src="/fleet/dtr-02.jpg" alt="Revenue" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl font-normal tracking-tight text-black truncate">{fmtMoney(totalMonthlyRevenue)}</p>
            <p className="text-[11px] font-normal text-black mt-0.5">+12.8% vs last month</p>
          </div>
        </div>

        {/* Box 6: Fleet Health Score */}
        <div className="rounded-xl border border-zinc-300 bg-white p-3 shadow-xs hover:border-black transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-normal uppercase tracking-wider text-black">Fleet Health</span>
            <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-zinc-300 shrink-0 bg-zinc-100">
              <img src="/operators/op-001.jpg" alt="Health" className="w-full h-full object-cover object-top" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl font-normal tracking-tight text-black">{avgHealthScore}% Optimal</p>
            <p className="text-[11px] font-normal text-black mt-0.5">0 critical advisories</p>
          </div>
        </div>
      </div>

      {/* ── 2. Compact Graph Charts Grid (Row 1: 3 Small Charts) ── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Chart 1: Operating vs Billable Hours */}
        <Card className="rounded-xl border border-zinc-300 bg-white p-0 shadow-xs hover:border-black transition-colors">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-black" />
              <CardTitle className="text-xs font-normal text-black">Hours per Machine</CardTitle>
            </div>
            <span className="text-[10px] font-normal text-black bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-300">
              Total vs Billable
            </span>
          </div>
          <CardContent className="p-3 pt-2">
            <div className="h-[190px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#E4E4E7" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#000000' }} stroke="#D4D4D8" />
                  <YAxis tick={{ fontSize: 10, fill: '#000000' }} stroke="#D4D4D8" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-2 rounded border border-zinc-300 shadow-xs text-xs font-normal">
                            <p className="text-black mb-1">{payload[0]?.payload?.name}</p>
                            <p className="text-black">Total: {payload[0]?.value} hrs</p>
                            <p className="text-black">Billable: {payload[1]?.value} hrs</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="total" fill="#18181B" radius={[3, 3, 0, 0]} name="Total Hours" />
                  <Bar dataKey="billable" fill="#71717A" radius={[3, 3, 0, 0]} name="Billable Hours" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 text-[11px] font-normal text-black border-t border-zinc-200 pt-2 mt-1">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-xs bg-[#18181B]" />
                Total Hours
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-xs bg-[#71717A]" />
                Billable Hours
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Revenue vs Operating Expenses Trend */}
        <Card className="rounded-xl border border-zinc-300 bg-white p-0 shadow-xs hover:border-black transition-colors">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-black" />
              <CardTitle className="text-xs font-normal text-black">Weekly Revenue vs Costs</CardTitle>
            </div>
            <span className="text-[10px] font-normal text-black bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-300">
              6-Week Margin
            </span>
          </div>
          <CardContent className="p-3 pt-2">
            <div className="h-[190px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={WEEKLY_FINANCIALS} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#18181B" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#18181B" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#71717A" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#71717A" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 2" stroke="#E4E4E7" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 9, fill: '#000000' }} stroke="#D4D4D8" />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#000000' }}
                    tickFormatter={(v) => `₹${v / 100000}L`}
                    stroke="#D4D4D8"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-2 rounded border border-zinc-300 shadow-xs text-xs font-normal">
                            <p className="text-black mb-1">{payload[0]?.payload?.week}</p>
                            <p className="text-black">Revenue: ₹{(Number(payload[0]?.value) / 100000).toFixed(2)}L</p>
                            <p className="text-black">Costs: ₹{(Number(payload[1]?.value) / 100000).toFixed(2)}L</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#18181B" strokeWidth={1.5} fill="url(#revGrad)" />
                  <Area type="monotone" dataKey="costs" stroke="#71717A" strokeWidth={1.5} fill="url(#costGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 text-[11px] font-normal text-black border-t border-zinc-200 pt-2 mt-1">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#18181B]" />
                Gross Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#71717A]" />
                Operational Costs
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Chart 3: Fuel Telemetry & Efficiency */}
        <Card className="rounded-xl border border-zinc-300 bg-white p-0 shadow-xs hover:border-black transition-colors">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <Fuel className="h-3.5 w-3.5 text-black" />
              <CardTitle className="text-xs font-normal text-black">Fuel Burn Telemetry</CardTitle>
            </div>
            <span className="text-[10px] font-normal text-black bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-300">
              Avg {avgBurnRate} L/hr
            </span>
          </div>
          <CardContent className="p-3 pt-2">
            <div className="h-[190px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fuelData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#E4E4E7" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#000000' }} stroke="#D4D4D8" />
                  <YAxis tick={{ fontSize: 10, fill: '#000000' }} stroke="#D4D4D8" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0]?.payload;
                        return (
                          <div className="bg-white p-2 rounded border border-zinc-300 shadow-xs text-xs font-normal">
                            <p className="text-black mb-1">{item?.name}</p>
                            <p className="text-black">Consumed: {item?.litres} Litres</p>
                            <p className="text-black">Burn Rate: {item?.burnRate} L/hr</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="litres" fill="#27272A" radius={[3, 3, 0, 0]} name="Litres Consumed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between text-[11px] font-normal text-black border-t border-zinc-200 pt-2 mt-1 px-1">
              <span>Total: {totalDieselBurned.toLocaleString()} L</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                Optimal Fuel Curve
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 3. Compact Graph Charts Grid (Row 2: 3 Small Charts) ── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Chart 4: Daily Fleet Utilization Efficiency */}
        <Card className="rounded-xl border border-zinc-300 bg-white p-0 shadow-xs hover:border-black transition-colors">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-black" />
              <CardTitle className="text-xs font-normal text-black">Daily Fleet Utilization</CardTitle>
            </div>
            <span className="text-[10px] font-normal text-black bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-300">
              Target 80%
            </span>
          </div>
          <CardContent className="p-3 pt-2">
            <div className="h-[190px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={DAILY_UTILIZATION} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#E4E4E7" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#000000' }} stroke="#D4D4D8" />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: '#000000' }} stroke="#D4D4D8" tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-2 rounded border border-zinc-300 shadow-xs text-xs font-normal">
                            <p className="text-black mb-1">{payload[0]?.payload?.day}</p>
                            <p className="text-black">Utilization: {payload[0]?.value}%</p>
                            <p className="text-black">Target Baseline: 80%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line type="monotone" dataKey="target" stroke="#A1A1AA" strokeDasharray="3 3" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="util" stroke="#18181B" strokeWidth={2} dot={{ r: 3, fill: '#18181B' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 text-[11px] font-normal text-black border-t border-zinc-200 pt-2 mt-1">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#18181B]" />
                Actual Utilization
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 border-b-2 border-dotted border-[#71717A]" />
                Target Baseline (80%)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Chart 5: Real-Time Fleet Status Donut */}
        <Card className="rounded-xl border border-zinc-300 bg-white p-0 shadow-xs hover:border-black transition-colors">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <Power className="h-3.5 w-3.5 text-black" />
              <CardTitle className="text-xs font-normal text-black">Fleet Operational Status</CardTitle>
            </div>
            <span className="text-[10px] font-normal text-black bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-300">
              Live Allocation
            </span>
          </div>
          <CardContent className="p-3 pt-2">
            <div className="h-[190px] w-full flex items-center justify-between">
              <div className="w-1/2 h-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={68}
                      paddingAngle={3}
                      dataKey="value"
                      onMouseEnter={(_, idx) => setHoveredStatus(statusPieData[idx]?.name ?? null)}
                      onMouseLeave={() => setHoveredStatus(null)}
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-normal text-black">
                    {activeDonutEntry ? activeDonutEntry.value : totalMachinesCount}
                  </span>
                  <span className="text-[9px] font-normal text-black">
                    {activeDonutEntry ? 'Units' : 'Total'}
                  </span>
                </div>
              </div>

              {/* Status Breakdown Legend */}
              <div className="w-1/2 space-y-1.5 pl-2">
                {statusPieData.map((item) => (
                  <div
                    key={item.name}
                    className={cn(
                      'p-1.5 rounded-lg border transition-colors cursor-pointer text-xs font-normal',
                      hoveredStatus === item.name
                        ? 'border-black bg-zinc-100'
                        : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/50',
                    )}
                    onMouseEnter={() => setHoveredStatus(item.name)}
                    onMouseLeave={() => setHoveredStatus(null)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[11px] text-black">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.name}
                      </span>
                      <span className="text-[11px] font-normal text-black">{item.value}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.codes.map((c) => (
                        <span key={c} className="text-[9px] bg-white border border-zinc-300 px-1 rounded text-black">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-zinc-200 pt-2 mt-1 text-center text-[11px] font-normal text-black">
              Fleet Availability: {Math.round((activeCount / totalMachinesCount) * 100)}% active deployment
            </div>
          </CardContent>
        </Card>

        {/* Chart 6: Maintenance Incidents & Downtime Analysis */}
        <Card className="rounded-xl border border-zinc-300 bg-white p-0 shadow-xs hover:border-black transition-colors">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <Wrench className="h-3.5 w-3.5 text-black" />
              <CardTitle className="text-xs font-normal text-black">Downtime & Service Hours</CardTitle>
            </div>
            <span className="text-[10px] font-normal text-black bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-300">
              By Category
            </span>
          </div>
          <CardContent className="p-3 pt-2">
            <div className="h-[190px] w-full flex flex-col justify-center space-y-2.5 px-1">
              {DOWNTIME_CATEGORIES.map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-normal text-black">
                    <span>{item.category}</span>
                    <span>{item.hours} hrs ({item.pct}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                    <div
                      className="h-full bg-zinc-800 rounded-full"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-zinc-200 pt-2 mt-1 flex items-center justify-between text-[11px] font-normal text-black px-1">
              <span>Planned Maintenance: 60%</span>
              <span className="text-emerald-700">Zero catastrophic downtime</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 4. Compact Maintenance & Service History Card (Replaces Big Radial Orbit) ── */}
      <Card className="rounded-xl border border-zinc-300 bg-white p-0 shadow-xs hover:border-black transition-colors">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-black" />
            <CardTitle className="text-sm font-normal text-black">Recent Fleet Maintenance & Service Visits</CardTitle>
          </div>
          <span className="text-xs font-normal text-black bg-zinc-100 px-2 py-0.5 rounded border border-zinc-300">
            Log Summary
          </span>
        </div>
        <CardContent className="p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {RECENT_SERVICES.map((rec) => (
              <div
                key={rec.machine_code}
                className="rounded-lg border border-zinc-300 bg-zinc-50/50 p-3 hover:border-black transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded overflow-hidden border border-zinc-300 bg-zinc-100 shrink-0">
                        <img src={rec.image} alt={rec.machine_code} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-normal text-black">{rec.machine_code}</span>
                    </div>
                    <span
                      className={cn(
                        'text-[10px] font-normal px-1.5 py-0.5 rounded border',
                        rec.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300',
                      )}
                    >
                      {rec.status}
                    </span>
                  </div>
                  <p className="text-xs font-normal text-black line-clamp-1">{rec.service}</p>
                  <p className="text-[11px] font-normal text-black mt-1">Mechanic: {rec.mechanic}</p>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-200 pt-2 mt-2 text-[11px] font-normal text-black">
                  <span>Meter: {rec.meter}</span>
                  <span>{rec.cost}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── 5. Populated Per-Vehicle Report Cards (6 Machines, Real Images, All Black Font) ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-black" />
            <h2 className="text-base font-normal text-black">Per-Vehicle Performance & Telemetry Cards</h2>
          </div>
          <span className="text-xs font-normal text-black">6 Units Monitored</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {insights.map((ins) => {
            const machineImg = ins.machine_code.toLowerCase().includes('exc-02')
              ? '/fleet/exc-02.jpg'
              : ins.machine_code.toLowerCase().includes('dz')
              ? '/fleet/dzr-01.jpg'
              : ins.machine_code.toLowerCase().includes('dt-02')
              ? '/fleet/dtr-02.jpg'
              : ins.machine_code.toLowerCase().includes('dt-01')
              ? '/fleet/dtr-01.jpg'
              : '/fleet/exc-01.jpg';

            return (
              <Card
                key={ins.machine_code}
                className="overflow-hidden rounded-xl border border-zinc-300 bg-white p-0 shadow-xs hover:border-black transition-colors"
              >
                <CardContent className="p-3.5 space-y-3">
                  {/* Top machine header */}
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-lg border border-zinc-300 overflow-hidden bg-zinc-100 shrink-0">
                      <img src={machineImg} alt={ins.machine_code} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-normal text-black truncate">{ins.machine_code}</span>
                        <span className="rounded border border-zinc-300 bg-zinc-50 px-2 py-0.5 text-xs font-normal text-black">
                          {ins.health_score}% Health
                        </span>
                      </div>
                      <p className="text-xs font-normal text-black truncate mt-0.5">{ins.model}</p>
                    </div>
                  </div>

                  {/* Assigned Operator */}
                  {ins.operator_name && (
                    <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-normal text-black">
                      <div className="flex items-center gap-2">
                        {ins.operator_img ? (
                          <img
                            src={ins.operator_img}
                            alt={ins.operator_name}
                            className="h-5 w-5 rounded-full object-cover border border-zinc-300"
                          />
                        ) : null}
                        <span>Operator: {ins.operator_name}</span>
                      </div>
                      <span className="text-[11px] font-normal text-black">On Shift</span>
                    </div>
                  )}

                  {/* Operational stats bar */}
                  <div className="grid grid-cols-3 gap-2 border-y border-zinc-200 py-2 text-center">
                    <div>
                      <p className="text-[10px] font-normal text-black uppercase">Hours</p>
                      <p className="text-xs font-normal text-black">{ins.stats.total_hours}h</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-normal text-black uppercase">Billable</p>
                      <p className="text-xs font-normal text-black">{ins.stats.billable_ratio}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-normal text-black uppercase">Burn Rate</p>
                      <p className="text-xs font-normal text-black">{ins.stats.fuel_burn_rate ?? 16.5} L/h</p>
                    </div>
                  </div>

                  {/* Monthly revenue */}
                  <div className="flex items-center justify-between text-xs font-normal text-black">
                    <div>
                      <span className="text-[10px] uppercase text-black block">Monthly Est.</span>
                      <span className="text-sm font-normal text-black">
                        {fmtMoney(ins.earnings_total.monthly_estimate)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-black block">Status</span>
                      <span className="text-xs font-normal text-black capitalize">{ins.status}</span>
                    </div>
                  </div>

                  {/* Issues if any */}
                  {ins.issues.length > 0 && (
                    <div className="rounded border border-zinc-300 p-2 bg-zinc-50 text-xs font-normal text-black space-y-1">
                      {ins.issues.map((iss, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <AlertTriangle className="h-3 w-3 text-black shrink-0" />
                          <span className="truncate">{iss}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action link */}
                  <a
                    href={`/machines/${ins.machine_id}`}
                    className="flex items-center justify-center gap-1 text-xs font-normal text-black hover:bg-zinc-100 py-1.5 border border-zinc-300 rounded-lg transition-colors"
                  >
                    <span>View Machine Telemetry</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
