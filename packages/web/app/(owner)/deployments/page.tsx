'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';
import {
  Truck, MapPin, Calendar, Pencil, Trash2, PauseCircle, Clock, CheckCircle2,
} from 'lucide-react';
import { fetchList } from '@/lib/api/fetch-list';
import { apiDelete } from '@/lib/api/mutations';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { BorderButton } from '@/components/ui/border-button';
import {
  RadialOrbitalTimeline,
  formatTimelineDate,
  type TimelineItem,
  type TimelineStatus,
} from '@/components/ui/radial-orbital-timeline';

interface DeploymentEntry {
  id: string;
  machine_id: string;
  site_id: string;
  site_name?: string;
  machine_code?: string;
  machine_type?: string;
  start_date: string;
  end_date?: string;
  status: string;
  machines?: { code: string };
  sites?: { name: string };
}

/** Maps a real deployment status onto the timeline status, badge, and icon. */
function deploymentLifecycle(status: string): {
  status: TimelineStatus;
  label: string;
  icon: LucideIcon;
} {
  switch (status) {
    case 'active':
      return { status: 'in-progress', label: 'Active', icon: Truck };
    case 'on_hold_payment':
      return { status: 'on-hold', label: 'On hold for payment', icon: PauseCircle };
    case 'pending':
      return { status: 'pending', label: 'Pending', icon: Clock };
    case 'ended':
      return { status: 'completed', label: 'Ended', icon: CheckCircle2 };
    default:
      return {
        status: 'pending',
        label: status
          ? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')
          : 'Unknown',
        icon: Clock,
      };
  }
}

export default function DeploymentsList() {
  const router = useRouter();
  const [deployments, setDeployments] = useState<DeploymentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    void fetchList<DeploymentEntry>('/api/v1/deployments').then((data) => {
      setDeployments(data);
    }).catch(() => {
      setDeployments([]);
    }).finally(() => setLoading(false));
  }, []);

  const handleDelete = (id: string, label: string) => setDeleteTarget({ id, label });

  const confirmDeleteDeployment = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiDelete(`/api/v1/deployments/${deleteTarget.id}`);
      setDeployments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deployments</h1>
          <p className="text-muted-foreground mt-1">Track machine assignments across all sites</p>
        </div>
        <Link href="/deployments/new">
          <Button >
            <span className="mr-2">+</span> New Deployment
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
      ) : deployments.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="text-6xl mb-4">🚜</div>
            <p className="text-gray-500 text-lg mb-2">No deployments yet</p>
            <p className="text-gray-400 text-sm">Create one to assign a machine to a site</p>
            <p className="mt-4 text-sm text-gray-500">
              Use the "+ New Deployment" button above to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {deployments.map((d) => (
            <Link key={d.id} href={`/deployments/${d.id}`}>
              <Card className="hover:border-slate-400 dark:hover:border-slate-500 transition-colors cursor-pointer group overflow-hidden h-full rounded-2xl border border-solid border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-0 shadow-none">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl border border-solid border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-black dark:text-white">
                        <Truck className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-black dark:text-white group-hover:text-black/80 transition-colors">
                          {d.machine_code ?? d.machines?.code ?? d.machine_id}
                        </h3>
                        <p className="text-xs text-black/60 dark:text-white/60">{d.machine_type ?? 'Machine'}</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-solid border-slate-300 dark:border-slate-700 text-black dark:text-white bg-transparent">
                      <span className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white" />
                      {d.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2 text-sm text-black/70 dark:text-white/70">
                      <MapPin className="h-4 w-4 text-black/50 dark:text-white/50" />
                      <span className="truncate">{d.site_name ?? d.sites?.name ?? d.site_id}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-black/70 dark:text-white/70">
                      <Calendar className="h-4 w-4 text-black/50 dark:text-white/50" />
                      <span>Since {d.start_date}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-solid border-slate-300 dark:border-slate-700">
                    <div className="text-xs text-black/60 dark:text-white/60 font-medium">
                      {d.end_date ? `Until ${d.end_date}` : 'Ongoing'}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.preventDefault(); router.push(`/deployments/${d.id}`); }}
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
                        onClick={(e) => { e.preventDefault(); void handleDelete(d.id, d.machine_code ?? 'deployment'); }}
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

      {/* ── Deployment lifecycle ── */}
      {deployments.length > 0 && (
        <div className="space-y-2">
          <div>
            <h2 className="text-lg font-semibold">Deployment lifecycle</h2>
            <p className="text-sm text-muted-foreground">
              Your {Math.min(deployments.length, 7)} most recent {deployments.length === 1 ? 'deployment' : 'deployments'}, newest first — colour and badge follow the live status.
            </p>
          </div>
          <RadialOrbitalTimeline
            hubLabel="Deployments"
            timelineData={deployments.slice(0, 7).map((d, index, all): TimelineItem => {
              const life = deploymentLifecycle(d.status);
              const siteName = d.site_name ?? d.sites?.name;
              return {
                id: index,
                title: d.machine_code ?? d.machine_type ?? 'Machine',
                date: d.start_date ? formatTimelineDate(d.start_date) : 'No date',
                category: siteName ?? 'Deployment',
                content: [
                  d.machine_type,
                  siteName ? `Site: ${siteName}` : null,
                  d.start_date ? `Since ${formatTimelineDate(d.start_date)}` : null,
                  d.end_date ? `Until ${formatTimelineDate(d.end_date)}` : 'Ongoing',
                ].filter(Boolean).join(' · ') || 'Deployment record',
                icon: life.icon,
                relatedIds: [index - 1, index + 1].filter((i) => i >= 0 && i < all.length),
                status: life.status,
                statusLabel: life.label,
              };
            })}
          />
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete deployment"
        desc={`Are you sure you want to delete "${deleteTarget?.label}"? This action cannot be undone.`}
        confirmText="Delete"
        destructive
        isLoading={deleting}
        handleConfirm={() => { void confirmDeleteDeployment(); }}
      />
    </div>
  );
}
