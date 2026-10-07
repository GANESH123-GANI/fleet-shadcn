'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/dashboard/glass-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, Navigation, Compass, AlertTriangle, Clock, 
  CheckCircle2, ArrowRight, ShieldAlert, Radio, Activity,
  Maximize2, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TripProgressItem {
  id: string;
  orderNumber: string;
  vehicle: string;
  driver: string;
  origin: string;
  destination: string;
  status: 'dispatched' | 'on_way' | 'at_site' | 'unloading' | 'completed';
  eta: string;
  delayMinutes: number;
  delayReason?: string;
  speed: number;
  geofenceStatus: 'inside_corridor' | 'dwell_warning' | 'breached';
}

const SAMPLE_TRIPS: TripProgressItem[] = [
  {
    id: 'trp-101',
    orderNumber: 'ORD-8921',
    vehicle: 'CAT 320D (EX-04)',
    driver: 'Rajesh Kumar',
    origin: 'Central Depot yard',
    destination: 'Metro Site Phase 2',
    status: 'on_way',
    eta: '14:20 (in 35m)',
    delayMinutes: 45,
    delayReason: 'Traffic jam NH-48 / Bypass lane',
    speed: 42,
    geofenceStatus: 'inside_corridor',
  },
  {
    id: 'trp-102',
    orderNumber: 'ORD-8924',
    vehicle: 'Volvo FMX Tipper (TP-09)',
    driver: 'Suresh Patil',
    origin: 'Quarry Site Alpha',
    destination: 'Crusher Unit 4',
    status: 'unloading',
    eta: 'Arrived at 13:05',
    delayMinutes: 0,
    speed: 0,
    geofenceStatus: 'inside_corridor',
  },
  {
    id: 'trp-103',
    orderNumber: 'ORD-8930',
    vehicle: 'JCB 3DX Eco (BL-02)',
    driver: 'Amit Verma',
    origin: 'Ring Road Depot',
    destination: 'Expressway Interchange',
    status: 'at_site',
    eta: 'On Site',
    delayMinutes: 20,
    delayReason: 'Gate entry clearance detention',
    speed: 4,
    geofenceStatus: 'dwell_warning',
  },
];

const STAGES = [
  { key: 'dispatched', label: 'Dispatched' },
  { key: 'on_way', label: 'On Way' },
  { key: 'at_site', label: 'At Site' },
  { key: 'unloading', label: 'Unloading' },
  { key: 'completed', label: 'Completed' },
] as const;

export function LiveOperationsPanel() {
  const [selectedTrip, setSelectedTrip] = useState<string>('trp-101');
  const [activeFilter, setActiveFilter] = useState<'all' | 'delayed'>('all');

  const filteredTrips = SAMPLE_TRIPS.filter((t) => 
    activeFilter === 'all' ? true : t.delayMinutes > 0
  );

  return (
    <div className="space-y-6">
      {/* Top Banner: Quick Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Live GPS Tracked</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">38</span>
              <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                <Radio className="h-3 w-3 mr-1 animate-pulse" /> Live
              </span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
            <Navigation className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Active Trips In Transit</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">14</span>
              <span className="text-xs text-slate-500">orders</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">On-Time Arrival (OTA)</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">92.4%</span>
              <span className="text-xs font-medium text-emerald-600">+1.8%</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/40 dark:bg-red-950/20 p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-red-600 dark:text-red-400">ETA Delay Exceptions</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-red-700 dark:text-red-300">3 Trips</span>
              <span className="text-xs font-medium text-red-600">Needs action</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Row: Real-Time Map & Trips Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive GPS Radar / Map Canvas */}
        <div className="lg:col-span-7">
          <GlassCard className="p-5 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Live GPS Fleet Radar & Geofences</h3>
                  <Badge variant="outline" className="text-xs border-emerald-500/40 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20">
                    Auto-refresh: 5s
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Real-time coordinates, speed telemetry, and virtual geofence boundaries</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Simulated Live GPS Map Graphic */}
            <div className="relative w-full h-80 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex flex-col items-center justify-center text-slate-300 shadow-inner">
              {/* Grid Background Pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-40" />

              {/* Geofence Zone A (Metro Site) */}
              <div className="absolute top-12 left-16 w-36 h-36 rounded-full border border-dashed border-emerald-500/60 bg-emerald-500/10 flex items-center justify-center">
                <span className="text-[10px] uppercase font-bold text-emerald-400 bg-slate-900/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Metro Site Geofence
                </span>
              </div>

              {/* Geofence Zone B (Quarry Alpha) */}
              <div className="absolute bottom-10 right-14 w-40 h-28 rounded-2xl border border-dashed border-blue-500/60 bg-blue-500/10 flex items-center justify-center">
                <span className="text-[10px] uppercase font-bold text-blue-400 bg-slate-900/80 px-2 py-0.5 rounded-full border border-blue-500/30">
                  Quarry Zone Alpha
                </span>
              </div>

              {/* Route Trajectory Polyline */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path
                  d="M 120 120 Q 240 180 340 160 T 480 230"
                  fill="none"
                  stroke="rgba(16, 185, 129, 0.5)"
                  strokeWidth="3"
                  strokeDasharray="6 6"
                />
              </svg>

              {/* Vehicle Marker 1 (EX-04 Moving) */}
              <div className="absolute top-[150px] left-[260px] flex flex-col items-center cursor-pointer group">
                <div className="relative flex items-center justify-center h-8 w-8 rounded-full bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/50 animate-bounce">
                  <Navigation className="h-4 w-4 rotate-45" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-300 animate-ping" />
                </div>
                <div className="mt-1 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-[11px] font-semibold text-white whitespace-nowrap shadow-md">
                  CAT EX-04 · 42 km/h
                </div>
              </div>

              {/* Vehicle Marker 2 (TP-09 Unloading) */}
              <div className="absolute bottom-[60px] right-[100px] flex flex-col items-center">
                <div className="h-7 w-7 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="mt-1 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-[10px] text-slate-200 whitespace-nowrap">
                  Volvo TP-09 · Unloading
                </div>
              </div>

              {/* Map Controls Overlay */}
              <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-2 text-xs flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[11px] text-slate-300">Moving (42 km/h)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-[11px] text-slate-300">Idle / Dwell</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-[11px] text-slate-300">At Geofence</span>
                </div>
              </div>
            </div>

            {/* Bottom Telemetry Bar */}
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-slate-400" /> Coordinate Center: 19.0760° N, 72.8777° E
              </span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Corridor Safety Status: 100% Compliant
              </span>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Geofence & Trip Progress + Delay Center */}
        <div className="lg:col-span-5 space-y-4">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Live Trip Pipeline & ETAs</h3>
                <p className="text-xs text-slate-500">Active order stages & bottleneck alerts</p>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={cn(
                    'px-2.5 py-1 rounded-md font-medium transition-colors',
                    activeFilter === 'all' ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500'
                  )}
                >
                  All (3)
                </button>
                <button
                  onClick={() => setActiveFilter('delayed')}
                  className={cn(
                    'px-2.5 py-1 rounded-md font-medium transition-colors',
                    activeFilter === 'delayed' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-500'
                  )}
                >
                  Delayed (2)
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredTrips.map((trip) => {
                const stageIndex = STAGES.findIndex((s) => s.key === trip.status);

                return (
                  <div
                    key={trip.id}
                    onClick={() => setSelectedTrip(trip.id)}
                    className={cn(
                      'p-3.5 rounded-xl border transition-all cursor-pointer',
                      selectedTrip === trip.id
                        ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/15 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    )}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{trip.orderNumber}</span>
                          <span className="text-xs text-slate-500">· {trip.vehicle}</span>
                        </div>
                        <p className="text-xs text-slate-500">Driver: {trip.driver}</p>
                      </div>

                      {trip.delayMinutes > 0 ? (
                        <Badge variant="destructive" className="text-[11px] font-semibold gap-1 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-300">
                          <Clock className="h-3 w-3" /> +{trip.delayMinutes}m Delay
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[11px] text-emerald-600 border-emerald-300 bg-emerald-50/40">
                          On Schedule
                        </Badge>
                      )}
                    </div>

                    {/* Progress Stepper */}
                    <div className="my-3">
                      <div className="grid grid-cols-5 gap-1 mb-1.5">
                        {STAGES.map((stage, idx) => (
                          <div
                            key={stage.key}
                            className={cn(
                              'h-1.5 rounded-full transition-colors',
                              idx <= stageIndex ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
                            )}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Dispatched</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          Current: {STAGES[stageIndex]?.label}
                        </span>
                        <span>Delivered</span>
                      </div>
                    </div>

                    {/* Details row */}
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-1 text-slate-500">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span className="truncate max-w-[140px]">{trip.destination}</span>
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        ETA: {trip.eta}
                      </span>
                    </div>

                    {/* Delay Alert message */}
                    {trip.delayReason && (
                      <div className="mt-2 text-[11px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-2 rounded-lg flex items-start gap-1.5 border border-red-200/50 dark:border-red-900/30">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span>Reason: {trip.delayReason}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
