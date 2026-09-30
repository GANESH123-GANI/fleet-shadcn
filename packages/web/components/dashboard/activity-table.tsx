'use client';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Machine {
  code: string;
  make: string;
  model: string;
  status: 'working' | 'idle' | 'breakdown' | 'transit' | 'service' | 'log_pending';
  site: string;
  todayHours?: number;
}

interface ActivityTableProps {
  machines: Machine[];
}

const STATUS_CONFIG = {
  working: {
    label: 'Working',
    dot: 'bg-emerald-500',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  idle: {
    label: 'Idle',
    dot: 'bg-amber-500',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  breakdown: {
    label: 'Breakdown',
    dot: 'bg-destructive',
    badgeClass: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  stopped: {
    label: 'Stopped',
    dot: 'bg-destructive',
    badgeClass: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  transit: {
    label: 'In transit',
    dot: 'bg-purple-500',
    badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
  service: {
    label: 'In service',
    dot: 'bg-blue-500',
    badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  log_pending: {
    label: 'Log pending',
    dot: 'bg-amber-500',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
};

export function ActivityTable({ machines }: ActivityTableProps) {
  return (
    <Card className="rounded-[20px] border border-border bg-card p-6 shadow-none">
      <div className="mb-4">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">Machine activity</h3>
        <p className="text-sm text-muted-foreground">{machines.length} machines · live operating board</p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[480px]">
          <div className="mb-3 grid grid-cols-[1.5fr_1fr_1fr_auto] gap-4 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:grid-cols-[2fr_1fr_1fr_auto]">
            <div>Machine</div>
            <div>Status</div>
            <div>Site</div>
            <div className="text-right">Today</div>
          </div>

          <div className="space-y-2">
            {machines.map((machine) => {
              const config = STATUS_CONFIG[machine.status];
              return (
                <div
                  key={machine.code}
                  className={cn(
                    'grid grid-cols-[1.5fr_1fr_1fr_auto] items-center gap-4 rounded-xl px-4 py-3 sm:grid-cols-[2fr_1fr_1fr_auto]',
                    'border border-border bg-card',
                    'transition-colors duration-200 hover:border-foreground/25'
                  )}
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{machine.code}</p>
                    <p className="text-xs text-muted-foreground">{machine.make} {machine.model}</p>
                  </div>

                  <div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium',
                        config.badgeClass
                      )}
                    >
                      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', config.dot)} />
                      {config.label}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm text-foreground/80">{machine.site}</p>
                  </div>

                  <div className="text-right">
                    <span className="whitespace-nowrap text-sm font-medium text-foreground">
                      {machine.todayHours ? `+${machine.todayHours} hrs` : '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
