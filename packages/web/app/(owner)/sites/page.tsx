'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Briefcase, Pencil, Trash2 } from 'lucide-react';
import { fetchList } from '@/lib/api/fetch-list';
import { apiDelete } from '@/lib/api/mutations';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { BorderButton } from '@/components/ui/border-button';
import {
  Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle,
} from '@/components/ui/empty';

interface SiteEntry {
  id: string;
  client_id: string;
  name: string;
  address?: string;
  location?: string;
  start_date?: string;
  estimated_end_date?: string;
  client_name?: string;
  status?: string;
  machine_count?: number;
  clients?: { name: string };
}

export default function SitesList() {
  const router = useRouter();
  const [sites, setSites] = useState<SiteEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    void fetchList<SiteEntry>('/api/v1/sites').then((data) => {
      setSites(data);
    }).catch(() => {
      setSites([]);
    }).finally(() => setLoading(false));
  }, []);

  const handleDelete = (id: string, name: string) => setDeleteTarget({ id, label: name });

  const confirmDeleteSite = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiDelete(`/api/v1/sites/${deleteTarget.id}`);
      setSites((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const uniqueSites = useMemo(() => {
    const seen = new Set<string>();
    return sites.filter((s) => {
      const name = String(s.name ?? '');
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });
  }, [sites]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sites</h1>
          <p className="text-muted-foreground mt-1">Manage your project locations and deployments</p>
        </div>
        <Link href="/sites/new">
          <Button >
            <span className="mr-2">+</span> New Site
          </Button>
        </Link>
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
      ) : uniqueSites.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon"><MapPin /></EmptyMedia>
                <EmptyTitle>No sites yet</EmptyTitle>
                <EmptyDescription>Create your first site to start deploying machines</EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="mt-6">
                <p className="text-sm text-gray-500">
                  Use the "+ New Site" button above to get started
                </p>
              </EmptyContent>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {uniqueSites.map((s) => (
            <Link key={s.id} href={`/sites/${s.id}`}>
              <Card className="hover:border-slate-400 dark:hover:border-slate-500 transition-colors cursor-pointer group overflow-hidden rounded-2xl border border-solid border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-0 shadow-none">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-black dark:text-white group-hover:text-black/80 transition-colors">
                        {s.name}
                      </h3>
                      <p className="text-sm text-black/60 dark:text-white/60 flex items-center gap-1 mt-1">
                        <Briefcase className="h-3.5 w-3.5" />
                        {s.client_name ?? s.clients?.name ?? 'Unknown Client'}
                      </p>
                    </div>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-solid border-slate-300 dark:border-slate-700 text-black dark:text-white bg-transparent">
                      <span className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white" />
                      {s.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="flex items-center gap-2 text-sm text-black/70 dark:text-white/70">
                      <MapPin className="h-4 w-4 text-black/50 dark:text-white/50" />
                      <span className="truncate">{s.address ?? s.location ?? 'No address'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-black/70 dark:text-white/70">
                      <Calendar className="h-4 w-4 text-black/50 dark:text-white/50" />
                      <span>{s.start_date ?? 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-solid border-slate-300 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[...Array(Math.min(s.machine_count ?? 0, 3))].map((_, i) => (
                          <div key={i} className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-black dark:text-white text-xs font-bold border border-solid border-slate-300 dark:border-slate-700">
                            {i + 1}
                          </div>
                        ))}
                      </div>
                      {(s.machine_count ?? 0) > 3 && (
                        <span className="text-xs text-black/60 dark:text-white/60">+{(s.machine_count ?? 0) - 3} more</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.preventDefault(); router.push(`/sites/${s.id}`); }}
                        className="p-1.5 rounded-lg text-black/60 hover:text-black hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <BorderButton
                        size='sm'
                        tone='destructive'
                        title='Delete'
                        aria-label='Delete'
                        onClick={(e) => { e.preventDefault(); void handleDelete(s.id, s.name); }}
                      >
                        <Trash2 aria-hidden='true' className='h-3.5 w-3.5' />
                      </BorderButton>
                    </div>
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
        title="Delete site"
        desc={`Are you sure you want to delete "${deleteTarget?.label}"? This action cannot be undone.`}
        confirmText="Delete"
        destructive
        isLoading={deleting}
        handleConfirm={() => { void confirmDeleteSite(); }}
      />
    </div>
  );
}
