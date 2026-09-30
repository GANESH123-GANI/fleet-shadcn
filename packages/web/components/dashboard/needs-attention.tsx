'use client';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, CreditCard } from 'lucide-react';

interface AlertItem {
  id: string;
  type: 'payment' | 'maintenance' | 'fuel';
  message: string;
  subtitle: string;
  urgency: 'action' | 'urgent' | 'soon';
}

interface NeedsAttentionProps {
  alerts: AlertItem[];
}

const URGENCY_CONFIG = {
  action: {
    label: 'Action',
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    border: 'border-destructive/20',
  },
  urgent: {
    label: 'Urgent',
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/20',
  },
  soon: {
    label: 'Soon',
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/20',
  },
};

const TYPE_ICONS = {
  payment: CreditCard,
  maintenance: AlertTriangle,
  fuel: Clock,
};

export function NeedsAttention({ alerts }: NeedsAttentionProps) {
  return (
    <Card className="rounded-[20px] border border-solid border-slate-300 dark:border-slate-700 bg-card p-6 shadow-none">
      <h3 className="mb-4 text-lg font-semibold tracking-tight text-black dark:text-white">Needs attention</h3>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const config = URGENCY_CONFIG[alert.urgency];
          const Icon = TYPE_ICONS[alert.type];
          return (
            <div
              key={alert.id}
              className="flex items-start gap-3 rounded-xl border border-solid border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 transition-colors"
            >
              <div className="mt-0.5 rounded-lg border border-solid border-slate-300 dark:border-slate-700 p-1.5 bg-slate-50 dark:bg-slate-800">
                <Icon className={cn('h-4 w-4 shrink-0', config.text)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-black dark:text-white">{alert.message}</p>
                <p className="text-xs text-black/60 dark:text-white/60 mt-0.5">{alert.subtitle}</p>
              </div>
              <Badge
                variant="outline"
                className="shrink-0 border border-solid border-slate-300 dark:border-slate-700 text-black dark:text-white bg-transparent text-xs font-semibold"
              >
                {config.label}
              </Badge>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
