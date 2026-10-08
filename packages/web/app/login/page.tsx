'use client';

import { AuthCard } from '@/components/auth/auth-card';

export default function LoginPage() {
  return (
    <main
      id="content"
      className="relative flex min-h-screen items-center justify-center bg-slate-50/80 px-4 py-12 overflow-hidden selection:bg-teal-500/20 selection:text-teal-900"
    >
      {/* Ambient background decoration */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(15,118,110,0.10),rgba(255,255,255,0))]" 
      />
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-60 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_50%,#000_60%,transparent_100%)]" 
      />

      <AuthCard initialTab="login" />
    </main>
  );
}
