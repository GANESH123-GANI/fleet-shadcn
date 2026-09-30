'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 outline-none overflow-hidden group rounded-xl",
  {
    variants: {
      variant: {
        default:
          'border border-solid border-slate-300 dark:border-slate-700 bg-white dark:bg-neutral-900 text-black dark:text-white hover:border-black dark:hover:border-white shadow-none',
        destructive:
          'border border-solid border-red-300 dark:border-red-600 bg-white dark:bg-neutral-900 text-red-700 dark:text-red-400 hover:border-red-600 dark:hover:border-red-400 shadow-none',
        outline:
          'border border-solid border-slate-300 dark:border-slate-700 bg-transparent text-black dark:text-white hover:border-black dark:hover:border-white shadow-none',
        secondary:
          'border border-solid border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-neutral-800 text-black dark:text-white hover:border-black dark:hover:border-white shadow-none',
        ghost:
          'border border-transparent text-black dark:text-white hover:bg-slate-100 dark:hover:bg-neutral-800',
        link: 'text-black dark:text-white underline-offset-4 hover:underline bg-transparent border-none p-0 h-auto',
      },
      size: {
        default: 'h-10 px-5 py-2.5',
        sm: 'h-8 rounded-lg px-3.5 text-xs',
        lg: 'h-12 px-7 text-base',
        icon: 'h-10 w-10 rounded-xl p-0',
        'icon-sm': 'h-8 w-8 rounded-lg p-0',
        'icon-xs': 'h-7 w-7 rounded-lg p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  if (asChild) {
    return (
      <Slot
        className={cn(buttonVariants({ variant, size, className }))}
      >
        {props.children}
      </Slot>
    );
  }

  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {/* Slide-in fill overlay */}
      <span className="absolute inset-0 z-0 -translate-x-full rounded-[inherit] bg-neutral-900 dark:bg-neutral-100 transition-transform duration-300 ease-in-out group-hover:translate-x-0" />
      {/* Arrow icon */}
      <svg
        className="relative z-10 h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
      {/* Content */}
      <span className="relative z-10 flex items-center gap-2 transition-colors duration-300 group-hover:text-white dark:group-hover:text-black">
        {props.children}
      </span>
    </button>
  );
}

export { Button, buttonVariants }
export type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }
