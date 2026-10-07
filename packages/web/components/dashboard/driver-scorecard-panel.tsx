'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/dashboard/glass-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, Award, AlertTriangle, ShieldCheck, UserCheck, 
  Plus, CheckCircle, Clock, ArrowRight, UserX, PhoneCall
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DriverItem {
  id: string;
  name: string;
  phone: string;
  assignedVehicle: string | null;
  status: 'on_trip' | 'available' | 'on_rest' | 'leave';
  score: number;
  harshBraking: number;
  speedingIncidents: number;
  idleHours: number;
}

const SAMPLE_DRIVERS: DriverItem[] = [
  {
    id: 'drv-1',
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    assignedVehicle: 'CAT 320D (EX-04)',
    status: 'on_trip',
    score: 94,
    harshBraking: 0,
    speedingIncidents: 0,
    idleHours: 0.4,
  },
  {
    id: 'drv-2',
    name: 'Suresh Patil',
    phone: '+91 98123 45678',
    assignedVehicle: 'Volvo FMX (TP-09)',
    status: 'on_trip',
    score: 88,
    harshBraking: 2,
    speedingIncidents: 1,
    idleHours: 1.1,
  },
  {
    id: 'drv-3',
    name: 'Amit Verma',
    phone: '+91 97654 32109',
    assignedVehicle: null,
    status: 'available',
    score: 96,
    harshBraking: 0,
    speedingIncidents: 0,
    idleHours: 0.2,
  },
  {
    id: 'drv-4',
    name: 'Manoj Singh',
    phone: '+91 99887 76655',
    assignedVehicle: null,
    status: 'available',
    score: 74,
    harshBraking: 5,
    speedingIncidents: 3,
    idleHours: 2.8,
  },
];

const UNASSIGNED_ORDERS = [
  { id: 'ord-901', client: 'Shapoorji Pallonji', site: 'Metro Depot P3', machineType: 'Excavator (20T)' },
  { id: 'ord-902', client: 'HCC Dam Works', site: 'River Diversion Point', machineType: 'Bulldozer (D85)' },
];

export function DriverScorecardPanel() {
  const [drivers, setDrivers] = useState<DriverItem[]>(SAMPLE_DRIVERS);
  const [assignedSuccess, setAssignedSuccess] = useState<string | null>(null);

  const handleQuickAssign = (orderId: string, driverId: string) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, status: 'on_trip', assignedVehicle: `Assigned to ${orderId}` } : d))
    );
    setAssignedSuccess(`Driver successfully assigned to order ${orderId}!`);
    setTimeout(() => setAssignedSuccess(null), 3000);
  };

  return (
    <div className="space-y-6">
      {assignedSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          {assignedSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Driver Behavior & Safety Scorecards */}
        <div className="lg:col-span-7">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Driver Behavioral Scorecards</h3>
                  <Badge variant="outline" className="text-xs border-emerald-500/40 text-emerald-600 bg-emerald-50/50">
                    Telematics Safety AI
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Monitoring harsh braking, speeding, and prolonged idle times</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 font-semibold text-emerald-600">
                  <ShieldCheck className="h-4 w-4" /> Avg Score: 88/100
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {drivers.map((drv) => (
                <div
                  key={drv.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-card hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{drv.name}</span>
                      <Badge
                        variant={drv.status === 'on_trip' ? 'default' : drv.status === 'available' ? 'outline' : 'secondary'}
                        className={cn(
                          'text-[10px] capitalize',
                          drv.status === 'available' && 'border-emerald-400 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20',
                          drv.status === 'on_trip' && 'bg-blue-600 text-white'
                        )}
                      >
                        {drv.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      {drv.assignedVehicle ? `Vehicle: ${drv.assignedVehicle}` : 'Ready for assignment'}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                      <span>Braking: {drv.harshBraking}</span>
                      <span>Speeding: {drv.speedingIncidents}</span>
                      <span>Idle: {drv.idleHours}h</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:border-l sm:pl-4 border-slate-100 dark:border-slate-800">
                    <div className="text-right">
                      <span className={cn(
                        'text-lg font-extrabold',
                        drv.score >= 90 ? 'text-emerald-600' : drv.score >= 80 ? 'text-blue-600' : 'text-amber-600'
                      )}>
                        {drv.score}
                        <span className="text-xs font-normal text-slate-400">/100</span>
                      </span>
                      <span className="text-[10px] text-slate-400 block">Safety Score</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Instant Task Assignment Canvas */}
        <div className="lg:col-span-5">
          <GlassCard className="p-5 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Task Assignment Canvas</h3>
                  <p className="text-xs text-slate-500">Link unassigned drivers to open customer orders</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  2 Pending Orders
                </Badge>
              </div>

              <div className="space-y-4">
                {UNASSIGNED_ORDERS.map((ord) => {
                  const availableDriver = drivers.find((d) => d.status === 'available');

                  return (
                    <div
                      key={ord.id}
                      className="p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">{ord.client}</span>
                          <p className="text-[11px] text-slate-500">{ord.site} · {ord.machineType}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          Unassigned
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs">
                        {availableDriver ? (
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-emerald-600" />
                            <span className="text-slate-700 dark:text-slate-300 font-medium">{availableDriver.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">No driver idle</span>
                        )}

                        <Button
                          size="sm"
                          disabled={!availableDriver}
                          onClick={() => availableDriver && handleQuickAssign(ord.id, availableDriver.id)}
                          className="h-7 text-xs bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                        >
                          Assign Driver
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> 2 Available Operators
              </span>
              <button className="text-xs text-slate-900 dark:text-slate-100 font-semibold hover:underline">
                View Roster →
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
