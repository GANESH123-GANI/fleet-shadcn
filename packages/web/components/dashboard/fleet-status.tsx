'use client';

import { Card } from '@/components/ui/card';

interface StatusItem {
  label: string;
  count: number;
  color: string;
}

interface FleetStatusProps {
  statuses: StatusItem[];
  total: number;
}

export function FleetStatus({ statuses, total }: FleetStatusProps) {
  return (
    <Card className="rounded-[20px] border border-solid border-slate-300 dark:border-slate-700 bg-card p-6 shadow-none">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold tracking-tight text-black dark:text-white">Fleet status</h3>
        <span className="inline-flex items-center rounded-lg border border-solid border-slate-300 dark:border-slate-700 bg-transparent px-2.5 py-1 text-xs font-medium text-black dark:text-white">
          {total} machines
        </span>
      </div>

      <div className="space-y-4">
        {statuses.map((item) => {
          const pct = total > 0 ? (item.count / total) * 100 : 0;
          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-black dark:text-white">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-black dark:text-white">{item.count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
