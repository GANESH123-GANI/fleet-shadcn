'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { fetchListStrict } from '@/lib/api/fetch-list';
import { useAuth } from '@/lib/auth/context';
import { ApiErrorBanner } from '@/components/api-error-banner';
import { RecordActions } from '@/components/records/record-actions';
import { Play, Clock, ArrowRight, CheckCircle, Gauge } from 'lucide-react';

export default function OpsWorkSession() {
  const { user } = useAuth();
  const isReadOnly = user?.role === 'owner' || user?.role === 'admin';
  
  const [activeSessions, setActiveSessions] = useState<Record<string, unknown>[]>([]);
  const [completedSessions, setCompletedSessions] = useState<Record<string, unknown>[]>([]);
  const [apiError, setApiError] = useState(false);

  const loadSessions = () => {
    setApiError(false);
    void fetchListStrict<Record<string, unknown>>('/api/v1/work-sessions')
      .then(sessions => {
        // API up → show exactly what's in the DB (empty = empty state)
        setActiveSessions(sessions.filter(s => !s.end_at));
        setCompletedSessions(sessions.filter(s => s.end_at).slice(0, 5));
      })
      .catch(() => setApiError(true));
  };

  useEffect(() => { loadSessions(); }, []);

  return (
    <div className="space-y-6">
      {apiError && <ApiErrorBanner onRetry={loadSessions} />}
      {/* Header */}
      <div className="rounded-2xl border border-solid border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-none">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white tracking-tight">Work Sessions</h1>
            <p className="text-sm text-black/70 dark:text-white/70">Track machine operating hours and activity</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-3xl font-bold text-black dark:text-white">{activeSessions.length}</p>
              <p className="text-xs text-black/60 dark:text-white/60">Active Now</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {!isReadOnly && (
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/work-session/new">
            <div className="group rounded-2xl border border-solid border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-none hover:border-slate-400 dark:hover:border-slate-500 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl border border-solid border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-black dark:text-white">
                  <Play className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-black dark:text-white">Start New Session</h3>
                  <p className="text-sm text-black/60 dark:text-white/60">Begin tracking a new machine session</p>
                </div>
                <ArrowRight className="h-5 w-5 text-black/50 ml-auto group-hover:text-black dark:group-hover:text-white transition-colors" />
              </div>
            </div>
          </Link>
          <Link href="/today">
            <div className="group rounded-2xl border border-solid border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-none hover:border-slate-400 dark:hover:border-slate-500 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl border border-solid border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-black dark:text-white">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-black dark:text-white">Back to Today</h3>
                  <p className="text-sm text-black/60 dark:text-white/60">View fleet dashboard</p>
                </div>
                <ArrowRight className="h-5 w-5 text-black/50 ml-auto group-hover:text-black dark:group-hover:text-white transition-colors" />
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div className="rounded-2xl border border-solid border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-none overflow-hidden">
          <div className="flex items-center gap-2 border-b border-solid border-slate-300 dark:border-slate-700 px-6 py-4">
            <Play className="h-5 w-5 text-black dark:text-white" />
            <h2 className="text-base font-bold text-black dark:text-white">
              Active Sessions ({activeSessions.length})
            </h2>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {activeSessions.map((session: Record<string, unknown>) => (
              <div key={session.id as string} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg border border-solid border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-black dark:text-white">
                    <Gauge className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-black dark:text-white">{session.machine_code as string || 'Machine'}</p>
                    <p className="text-sm text-black/60 dark:text-white/60">
                      Started {new Date(session.start_at as string).toLocaleTimeString()} · Meter: {session.start_meter as number}
                    </p>
                  </div>
                </div>
                {!isReadOnly && (
                  <Link href={`/work-session/${session.id as string}/end`}>
                    <Button variant="destructive" size="sm">End Session</Button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Completed Sessions */}
      {completedSessions.length > 0 && (
        <div className="rounded-2xl border border-solid border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-none overflow-hidden">
          <div className="flex items-center gap-2 border-b border-solid border-slate-300 dark:border-slate-700 px-6 py-4">
            <CheckCircle className="h-5 w-5 text-black dark:text-white" />
            <h2 className="text-base font-bold text-black dark:text-white">
              Recent Sessions
            </h2>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {completedSessions.map((session: Record<string, unknown>) => (
              <div key={session.id as string} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg border border-solid border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-black dark:text-white">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{session.machine_code as string || 'Machine'}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(session.start_at as string).toLocaleTimeString()} → {session.end_at ? new Date(session.end_at as string).toLocaleTimeString() : '—'}
                    </p>
                    <p className="text-sm text-slate-500">
                      Meter: {session.start_meter as number} → {session.end_meter as number || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                    {session.end_at ? `${((new Date(session.end_at as string).getTime() - new Date(session.start_at as string).getTime()) / 3600000).toFixed(1)} hrs` : 'Running'}
                  </span>
                  <RecordActions table="work_sessions" row={session} onChanged={loadSessions} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {activeSessions.length === 0 && completedSessions.length === 0 && (
        <div className="rounded-xl border border-[#E5E2DB] bg-white p-12 shadow-[0_1px_3px_rgba(0,0,0,0.04)] text-center">
          <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No sessions yet</h3>
          <p className="text-slate-500 mb-6">Start your first work session to begin tracking machine activity.</p>
          {!isReadOnly && (
            <Link href="/work-session/new">
              <Button>
                <Play className="mr-2 h-4 w-4" /> Start First Session
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
