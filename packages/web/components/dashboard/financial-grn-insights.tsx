'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/dashboard/glass-card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, IndianRupee, ArrowUpRight, TrendingUp, TrendingDown, 
  Scale, CheckCircle2, Clock, FileCheck, Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GRNDocument {
  id: string;
  grnNumber: string;
  orderNumber: string;
  client: string;
  dispatchWeightTon: number;
  destinationWeightTon: number;
  weightVarianceTon: number;
  status: 'draft' | 'pending' | 'approved' | 'settled';
  amount: number;
  date: string;
}

const SAMPLE_GRNS: GRNDocument[] = [
  {
    id: 'grn-1',
    grnNumber: 'GRN-2026-081',
    orderNumber: 'ORD-8921',
    client: 'L&T Infra Projects',
    dispatchWeightTon: 24.5,
    destinationWeightTon: 24.4,
    weightVarianceTon: -0.1,
    status: 'approved',
    amount: 145000,
    date: 'Today, 11:30 AM',
  },
  {
    id: 'grn-2',
    grnNumber: 'GRN-2026-082',
    orderNumber: 'ORD-8924',
    client: 'Tata Steel Aggregates',
    dispatchWeightTon: 32.0,
    destinationWeightTon: 31.8,
    weightVarianceTon: -0.2,
    status: 'pending',
    amount: 198000,
    date: 'Today, 12:45 PM',
  },
  {
    id: 'grn-3',
    grnNumber: 'GRN-2026-083',
    orderNumber: 'ORD-8930',
    client: 'Afcons Expressway Site',
    dispatchWeightTon: 18.2,
    destinationWeightTon: 18.2,
    weightVarianceTon: 0.0,
    status: 'settled',
    amount: 88500,
    date: 'Yesterday',
  },
  {
    id: 'grn-4',
    grnNumber: 'GRN-2026-084',
    orderNumber: 'ORD-8935',
    client: 'GMR Aero Infrastructure',
    dispatchWeightTon: 28.0,
    destinationWeightTon: 0,
    weightVarianceTon: 0,
    status: 'draft',
    amount: 165000,
    date: 'Draft created',
  },
];

const GRN_PIPELINE_STAGES = [
  { key: 'draft', label: 'Draft', count: 4, color: 'bg-slate-500' },
  { key: 'pending', label: 'Pending Approval', count: 6, color: 'bg-amber-500' },
  { key: 'approved', label: 'Approved & Billed', count: 18, color: 'bg-blue-500' },
  { key: 'settled', label: 'Settled & Paid', count: 32, color: 'bg-emerald-500' },
] as const;

export function FinancialGRNInsights() {
  const [filterStage, setFilterStage] = useState<string>('all');

  const filteredGRNs = SAMPLE_GRNS.filter((g) => 
    filterStage === 'all' ? true : g.status === filterStage
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Trip Budgets, Overheads & Profit Margins */}
        <div className="lg:col-span-5 space-y-4">
          <GlassCard className="p-5 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Trip Budgets & Profit Margins</h3>
                  <p className="text-xs text-slate-500">Revenue vs. overheads (Fuel, driver allowance, tolls)</p>
                </div>
                <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300">
                  +18.4% Net Margin
                </Badge>
              </div>

              {/* High Level Financial KPIs */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-card">
                  <span className="text-[11px] font-medium text-slate-500">Avg Cost / Km</span>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">₹38.50</p>
                  <span className="text-[10px] text-emerald-600 font-medium">↓ ₹2.10 vs last month</span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-card">
                  <span className="text-[11px] font-medium text-slate-500">Avg Trip Profit</span>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">₹4,280</p>
                  <span className="text-[10px] text-emerald-600 font-medium">↑ +6.4% profit/run</span>
                </div>
              </div>

              {/* Expense Allocation Stack Bar */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Expense Breakdown per ₹100 Revenue:</span>
                <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                  <div className="bg-amber-500 h-full" style={{ width: '42%' }} title="Fuel & Diesel (42%)" />
                  <div className="bg-blue-500 h-full" style={{ width: '18%' }} title="Driver & Crew (18%)" />
                  <div className="bg-indigo-500 h-full" style={{ width: '12%' }} title="Maintenance & Tolls (12%)" />
                  <div className="bg-emerald-500 h-full" style={{ width: '28%' }} title="Net Operating Profit (28%)" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>Diesel Overhead: 42%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    <span>Driver & Crew: 18%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    <span>Tolls & Maintenance: 12%</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Net Operating Profit: 28%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
              <span>Unbilled Trips Pending Settlement: 6</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">Value: ₹1,85,000</span>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Goods Receipt Note (GRN) Pipeline & Verification */}
        <div className="lg:col-span-7">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Goods Receipt Note (GRN) Pipeline</h3>
                  <Badge variant="outline" className="text-xs">
                    Weight & Invoice Sync
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Workflow documentation matching dispatch weights to customer receiving</p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setFilterStage('all')}
                  className={cn(
                    'px-2 py-1 rounded font-medium',
                    filterStage === 'all' ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500'
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStage('pending')}
                  className={cn(
                    'px-2 py-1 rounded font-medium',
                    filterStage === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500'
                  )}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilterStage('approved')}
                  className={cn(
                    'px-2 py-1 rounded font-medium',
                    filterStage === 'approved' ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-500'
                  )}
                >
                  Approved
                </button>
              </div>
            </div>

            {/* Pipeline Stage Indicators */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {GRN_PIPELINE_STAGES.map((stg) => (
                <div key={stg.key} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-card/60 text-center">
                  <span className="text-[10px] text-slate-400 block truncate">{stg.label}</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{stg.count}</span>
                </div>
              ))}
            </div>

            {/* GRN Items List */}
            <div className="space-y-3">
              {filteredGRNs.map((grn) => (
                <div
                  key={grn.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-card hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{grn.grnNumber}</span>
                      <span className="text-xs text-slate-500">· {grn.orderNumber}</span>
                      <Badge
                        variant={
                          grn.status === 'settled'
                            ? 'default'
                            : grn.status === 'approved'
                            ? 'secondary'
                            : grn.status === 'pending'
                            ? 'outline'
                            : 'outline'
                        }
                        className={cn(
                          'text-[10px] capitalize',
                          grn.status === 'pending' && 'border-amber-400 text-amber-700 bg-amber-50 dark:bg-amber-950/20',
                          grn.status === 'settled' && 'bg-emerald-600 text-white'
                        )}
                      >
                        {grn.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{grn.client}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Scale className="h-3 w-3 text-slate-400" />
                        Dispatch: {grn.dispatchWeightTon}T → Received: {grn.destinationWeightTon > 0 ? `${grn.destinationWeightTon}T` : 'Pending'}
                      </span>
                      {grn.weightVarianceTon !== 0 && (
                        <span className="text-amber-600 font-medium">
                          Δ {grn.weightVarianceTon}T variance
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right sm:border-l sm:pl-4 border-slate-100 dark:border-slate-800 shrink-0">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      ₹{grn.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400 block">{grn.date}</span>
                    <button className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium mt-1 inline-flex items-center gap-0.5">
                      View GRN Slip <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
