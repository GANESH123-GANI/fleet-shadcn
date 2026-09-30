'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface GlassCardProps extends React.ComponentProps<typeof Card> {
  children?: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = true, ...props }: GlassCardProps) {
  return (
    <Card
      className={cn(
        'rounded-[20px] border border-solid border-slate-300 dark:border-slate-700 bg-card p-6 shadow-none transition-colors duration-200',
        hover && 'hover:border-slate-400 dark:hover:border-slate-600',
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
}
