'use client';

import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface KPICardProps {
  label: string;
  value: number | string;
  suffix?: string;
  trend?: number;
  trendLabel?: string;
  statusDot?: string;
  subtitle?: string;
}

export function KPICard({
  label,
  value,
  suffix = '',
  trend,
  trendLabel = 'vs last period',
  statusDot,
  subtitle,
}: KPICardProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, '')) || 0;

  useEffect(() => {
    if (typeof value !== 'number') return;
    
    const duration = 1200;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setAnimatedValue(numericValue);
        clearInterval(timer);
      } else {
        setAnimatedValue(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [numericValue, value]);

  const displayValue = typeof value === 'number'
    ? animatedValue.toLocaleString('en-IN')
    : value;

  return (
    <Card className="rounded-[20px] border border-solid border-slate-300 dark:border-slate-700 bg-card p-6 shadow-none transition-colors hover:border-slate-400 dark:hover:border-slate-600">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-black dark:text-white">{label}</p>
        {statusDot && (
          <span className="relative flex h-2.5 w-2.5">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
              style={{ backgroundColor: statusDot }}
            />
            <span
              className="relative inline-flex h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: statusDot }}
            />
          </span>
        )}
      </div>

      <p className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-black dark:text-white">
        {displayValue}
        {suffix && <span className="ml-1 text-sm sm:text-base font-normal text-black/70 dark:text-white/70">{suffix}</span>}
      </p>

      {subtitle && (
        <div className="mt-2.5">
          <span className="inline-flex items-center rounded-lg border border-solid border-slate-300 dark:border-slate-700 bg-transparent px-2.5 py-1 text-xs font-medium text-black dark:text-white">
            {subtitle}
          </span>
        </div>
      )}

      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              'px-2 py-0.5 text-xs font-semibold gap-1 border border-solid border-slate-300 dark:border-slate-700',
              trend >= 0
                ? 'text-black dark:text-white bg-transparent'
                : 'text-black dark:text-white bg-transparent'
            )}
          >
            {trend >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {Math.abs(trend)}%
          </Badge>
          <span className="text-xs text-black/60 dark:text-white/60">{trendLabel}</span>
        </div>
      )}
    </Card>
  );
}
