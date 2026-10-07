'use client';

import React from 'react';
import { GlassCard } from '@/components/dashboard/glass-card';
import { Badge } from '@/components/ui/badge';
import { 
  Gauge, Wrench, Fuel, AlertOctagon, BatteryCharging, 
  CheckCircle, ArrowUpRight, TrendingUp, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function FleetHealthMetrics() {
  const maintenanceAlerts = [
    {
      id: 'm-1',
      vehicle: 'CAT 320D (EX-04)',
      type: 'Periodic Service',
      threshold: '250-Hr Engine Oil & Filter',
      remaining: '18 hours remaining',
      urgency: 'critical',
      code: 'PM-250H',
    },
    {
      id: 'm-2',
      vehicle: 'Volvo FMX Tipper (TP-09)',
      type: 'Diagnostic Code (OBD-II)',
      threshold: 'P0420: Catalytic Efficiency Low',
      remaining: 'Sensor check needed',
      urgency: 'warning',
      code: 'DTC-P0420',
    },
    {
      id: 'm-3',
      vehicle: 'Komatsu D85 (DZ-01)',
      type: 'Hydraulic System',
      threshold: 'Hydraulic Return Filter Delta-P',
      remaining: 'Due in 42 hours',
      urgency: 'routine',
      code: 'HYD-FLT',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Fleet Resource Aggregators Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Utilization Rate */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Fleet Utilization</span>
            <span className="flex items-center text-xs font-semibold text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> +4.2%
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">84.6%</span>
            <span className="text-xs text-slate-400">Target: 80%</span>
          </div>
          {/* Visual bar breakdown */}
          <div className="space-y-1.5">
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: '84.6%' }} title="Active Working" />
              <div className="bg-amber-400 h-full" style={{ width: '10.2%' }} title="Idle" />
              <div className="bg-red-400 h-full" style={{ width: '5.2%' }} title="Maintenance" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active 85%</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Idle 10%</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-400" /> Service 5%</span>
            </div>
          </div>
        </div>

        {/* Total Odometer & Engine Hours */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Cumulative Telematics</span>
            <div className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <Gauge className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-50">142,850</span>
              <span className="text-xs font-medium text-slate-500">km run</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">8,420 total engine hours logged</p>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500">
            <span>Avg Distance/Day: 184 km</span>
            <span className="text-emerald-600 font-medium">99.1% sync</span>
          </div>
        </div>

        {/* Fuel & Consumables Efficiency */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Fuel & Diesel Efficiency</span>
            <div className="h-7 w-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <Fuel className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-50">4.2 L/hr</span>
              <span className="text-xs font-medium text-emerald-600">-0.3 L/hr</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Total diesel consumed: 12,450 Litres</p>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500">
            <span>Idle fuel wastage: 2.1%</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">Optimal range</span>
          </div>
        </div>

        {/* AdBlue / DEF & Fluid Levels */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">DEF / AdBlue Fluid Levels</span>
            <div className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
              <BatteryCharging className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-50">76%</span>
              <span className="text-xs font-medium text-slate-400">fleet average</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">2 vehicles below 20% refill threshold</p>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: '76%' }} />
          </div>
        </div>
      </div>

      {/* 2. Predictive Maintenance & Diagnostic Cards */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Predictive Maintenance & OBD-II Diagnostics</h3>
              <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-600 bg-amber-50/50">
                3 Warnings Active
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Telemetry-based preventative failure detection and periodic service schedules</p>
          </div>
          <button className="text-xs font-medium text-slate-900 dark:text-slate-100 hover:underline flex items-center gap-1">
            Service Schedule <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {maintenanceAlerts.map((item) => (
            <div
              key={item.id}
              className={cn(
                'rounded-xl border p-4 flex flex-col justify-between space-y-3 transition-colors',
                item.urgency === 'critical'
                  ? 'border-red-200 dark:border-red-900/50 bg-red-50/20 dark:bg-red-950/10'
                  : item.urgency === 'warning'
                  ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50/20 dark:bg-amber-950/10'
                  : 'border-slate-200 dark:border-slate-800 bg-card'
              )}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.vehicle}</span>
                  <Badge
                    variant={item.urgency === 'critical' ? 'destructive' : 'outline'}
                    className={cn(
                      'text-[10px] font-semibold',
                      item.urgency === 'warning' && 'border-amber-400 text-amber-700 bg-amber-50'
                    )}
                  >
                    {item.code}
                  </Badge>
                </div>
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100">{item.threshold}</p>
                <p className="text-[11px] text-slate-500">{item.type}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className={cn(
                  'font-semibold flex items-center gap-1',
                  item.urgency === 'critical' ? 'text-red-600' : 'text-amber-600'
                )}>
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {item.remaining}
                </span>
                <button className="text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900">
                  Book Slot →
                </button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
