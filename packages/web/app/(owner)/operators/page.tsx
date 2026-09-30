'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { User, Phone, Award, MapPin, Truck, Pencil, Trash2 } from 'lucide-react';
import { fetchList } from '@/lib/api/fetch-list';
import { apiDelete } from '@/lib/api/mutations';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { BorderButton } from '@/components/ui/border-button';
import {
  Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle,
} from '@/components/ui/empty';

interface OperatorEntry {
  id: string;
  name: string;
  phone?: string;
  license?: string;
  experience_years?: number;
  specialization?: string;
  is_active?: boolean;
  assigned_machine?: string | null;
  site?: string | null;
}

export default function OwnerOperators() {
  const router = useRouter();
  const [operators, setOperators] = useState<OperatorEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchList<OperatorEntry>('/api/v1/operators')
      .then((data) => {
        setOperators(data);
      })
      .catch(() => {
        setOperators([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id: string, name: string) => setDeleteTarget({ id, label: name });

  const confirmDeleteOperator = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiDelete(`/api/v1/operators/${deleteTarget.id}`);
      setOperators((prev) => prev.filter((o) => o.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const uniqueOperators = useMemo(() => {
    const seen = new Set<string>();
    return operators.filter((o) => {
      const name = String(o.name ?? '');
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });
  }, [operators]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Operators</h1>
          <p className="text-muted-foreground mt-1">Manage your machine operators and assignments</p>
        </div>
        <Link href="/operators/new">
          <Button >
            <span className="mr-2">+</span> Add Operator
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : operators.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon"><User /></EmptyMedia>
                <EmptyTitle>No operators yet</EmptyTitle>
                <EmptyDescription>Add your first operator to get started</EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="mt-6">
                <p className="text-sm text-gray-500">
                  Use the "+ Add Operator" button above to get started
                </p>
              </EmptyContent>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {uniqueOperators.map((o) => (
            <Card key={o.id} className={`hover:border-slate-400 dark:hover:border-slate-500 transition-colors overflow-hidden rounded-2xl border border-solid border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-0 shadow-none ${!o.is_active ? 'opacity-75' : ''}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl border border-solid border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-black dark:text-white">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-black dark:text-white">{o.name}</h3>
                      <p className="text-xs text-black/60 dark:text-white/60">{o.specialization ?? 'Operator'}</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-solid border-slate-300 dark:border-slate-700 text-black dark:text-white bg-transparent">
                    <span className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white" />
                    {o.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-2 mt-4">
                  {o.phone && (
                    <div className="flex items-center gap-2 text-sm text-black/70 dark:text-white/70">
                      <Phone className="h-4 w-4 text-black/50 dark:text-white/50" />
                      <span>{o.phone}</span>
                    </div>
                  )}
                  {o.license && (
                    <div className="flex items-center gap-2 text-sm text-black/70 dark:text-white/70">
                      <Award className="h-4 w-4 text-black/50 dark:text-white/50" />
                      <span>{o.license}</span>
                    </div>
                  )}
                  {o.experience_years && (
                    <div className="flex items-center gap-2 text-sm text-black/70 dark:text-white/70">
                      <span className="text-black/50 dark:text-white/50">⏱️</span>
                      <span>{o.experience_years} years experience</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-solid border-slate-300 dark:border-slate-700">
                  {o.assigned_machine ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-black dark:text-white" />
                        <span className="text-sm font-medium text-black dark:text-white">{o.assigned_machine}</span>
                      </div>
                      {o.site && (
                        <div className="flex items-center gap-1 text-xs text-black/60 dark:text-white/60">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-[100px]">{o.site}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-black/50 dark:text-white/50 text-center">No assignment</p>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-solid border-slate-300 dark:border-slate-700">
                  <button
                    onClick={() => router.push(`/operators/${o.id}`)}
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
                    onClick={() => void handleDelete(o.id, o.name)}
                  >
                    <Trash2 aria-hidden='true' className='h-3.5 w-3.5' />
                  </BorderButton>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete operator"
        desc={`Are you sure you want to delete "${deleteTarget?.label}"? This action cannot be undone.`}
        confirmText="Delete"
        destructive
        isLoading={deleting}
        handleConfirm={() => { void confirmDeleteOperator(); }}
      />
    </div>
  );
}
