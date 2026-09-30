'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Building2, Phone, Mail, MapPin, Briefcase, IndianRupee, ArrowRight, Pencil, Trash2 } from 'lucide-react';
import { fetchList } from '@/lib/api/fetch-list';
import { apiDelete } from '@/lib/api/mutations';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { BorderButton } from '@/components/ui/border-button';
import { LongText } from '@/components/long-text';
import {
  Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle,
} from '@/components/ui/empty';

interface ClientEntry {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  currency?: string;
  payment_terms_days?: number;
  total_projects?: number;
  total_revenue?: number;
  status?: string;
}

export default function OwnerClients() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchList<ClientEntry>('/api/v1/clients')
      .then((data) => {
        setClients(data);
      })
      .catch(() => {
        setClients([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id: string, name: string) => setDeleteTarget({ id, label: name });

  const confirmDeleteClient = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiDelete(`/api/v1/clients/${deleteTarget.id}`);
      setClients((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const uniqueClients = useMemo(() => {
    const seen = new Set<string>();
    return clients.filter((c) => {
      const name = String(c.name ?? '');
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });
  }, [clients]);

  const activeClients = uniqueClients.filter(c => c.status === 'active').length;
  const totalRevenue = uniqueClients.reduce((sum, c) => sum + (c.total_revenue ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage your client relationships and projects</p>
        </div>
        <Link href="/clients/new">
          <Button >
            <span className="mr-2">+</span> Add Client
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-solid border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-none">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-black dark:text-white">Total Clients</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-solid border-slate-300 dark:border-slate-700 text-black dark:text-white">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-black dark:text-white">{uniqueClients.length}</span>
            <span className="inline-flex items-center rounded-md border border-solid border-slate-300 px-2 py-0.5 text-xs font-medium text-black dark:border-slate-700 dark:text-white">
              Registered
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-solid border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-none">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-black dark:text-white">Active Clients</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-solid border-slate-300 dark:border-slate-700 text-black dark:text-white">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-black dark:text-white">{activeClients}</span>
            <span className="inline-flex items-center rounded-md border border-solid border-slate-300 px-2 py-0.5 text-xs font-medium text-black dark:border-slate-700 dark:text-white">
              Active
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-solid border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-none">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-black dark:text-white">Total Revenue</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-solid border-slate-300 dark:border-slate-700 text-black dark:text-white">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-black dark:text-white">₹{(totalRevenue / 100000).toFixed(1)}L</span>
            <span className="inline-flex items-center rounded-md border border-solid border-slate-300 px-2 py-0.5 text-xs font-medium text-black dark:border-slate-700 dark:text-white">
              Lifetime
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : uniqueClients.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon"><Building2 /></EmptyMedia>
                <EmptyTitle>No clients yet</EmptyTitle>
                <EmptyDescription>Add your first client to start managing projects</EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="mt-6">
                <p className="text-sm text-gray-500">
                  Use the "+ Add Client" button above to get started
                </p>
              </EmptyContent>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {uniqueClients.map((c) => (
            <Link key={c.id} href={`/clients/${c.id}`}>
              <Card className="hover:border-slate-400 dark:hover:border-slate-500 transition-colors cursor-pointer group overflow-hidden h-full rounded-2xl border border-solid border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-0 shadow-none">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl border border-solid border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-black dark:text-white">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-black dark:text-white group-hover:text-black/80 transition-colors">
                          {c.name}
                        </h3>
                        <p className="text-xs text-black/60 dark:text-white/60">{c.contact_person ?? 'Contact'}</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-solid border-slate-300 dark:border-slate-700 text-black dark:text-white bg-transparent">
                      <span className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white" />
                      {c.status}
                    </span>
                  </div>

                  <div className="space-y-2 mt-4">
                    {c.phone && (
                      <div className="flex items-center gap-2 text-sm text-black/70 dark:text-white/70">
                        <Phone className="h-4 w-4 text-black/50 dark:text-white/50" />
                        <span>{c.phone}</span>
                      </div>
                    )}
                    {c.email && (
                      <div className="flex items-center gap-2 text-sm text-black/70 dark:text-white/70">
                        <Mail className="h-4 w-4 shrink-0 text-black/50 dark:text-white/50" />
                        <LongText className="min-w-0 flex-1">{c.email}</LongText>
                      </div>
                    )}
                    {c.address && (
                      <div className="flex items-center gap-2 text-sm text-black/70 dark:text-white/70">
                        <MapPin className="h-4 w-4 shrink-0 text-black/50 dark:text-white/50" />
                        <LongText className="min-w-0 flex-1">{c.address}</LongText>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-solid border-slate-300 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-black dark:text-white">{c.total_projects ?? 0}</p>
                        <p className="text-[10px] text-black/60 dark:text-white/60">Projects</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-black dark:text-white">₹{((c.total_revenue ?? 0) / 100000).toFixed(1)}L</p>
                        <p className="text-[10px] text-black/60 dark:text-white/60">Revenue</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-black/50 group-hover:text-black group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <button
                      onClick={(e) => { e.preventDefault(); router.push(`/clients/${c.id}`); }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <BorderButton
                      size='sm'
                      tone='destructive'
                      title='Delete'
                      aria-label='Delete'
                      onClick={(e) => { e.preventDefault(); void handleDelete(c.id, c.name); }}
                    >
                      <Trash2 aria-hidden='true' className='h-3.5 w-3.5' />
                    </BorderButton>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete client"
        desc={`Are you sure you want to delete "${deleteTarget?.label}"? This action cannot be undone.`}
        confirmText="Delete"
        destructive
        isLoading={deleting}
        handleConfirm={() => { void confirmDeleteClient(); }}
      />
    </div>
  );
}
