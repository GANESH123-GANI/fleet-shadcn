'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  IndianRupee,
  ArrowRight,
  Pencil,
  Trash2,
  Search,
  Plus,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { fetchList, getCachedList } from '@/lib/api/fetch-list';
import { apiDelete } from '@/lib/api/mutations';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { BorderButton } from '@/components/ui/border-button';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
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

// ---------------------------------------------------------------------------
// Monochrome Corporate Client Brand Crests (Unbolded, Crisp Vector)
// ---------------------------------------------------------------------------

function LTLogo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded-lg bg-black text-white shrink-0 ${className}`}>
      <svg viewBox="0 0 40 40" className="h-5 w-5" fill="none">
        <polygon points="20,4 36,20 20,36 4,20" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
        <text x="20" y="24" fontSize="10" fontWeight="400" fill="#FFFFFF" textAnchor="middle" fontFamily="sans-serif">
          L&T
        </text>
      </svg>
    </div>
  );
}

function TataLogo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded-lg bg-black text-white shrink-0 ${className}`}>
      <svg viewBox="0 0 40 40" className="h-5 w-5" fill="none">
        <circle cx="20" cy="20" r="14" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
        <path d="M 12 16 Q 20 12 28 16" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M 14 21 Q 20 17 26 21" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
        <text x="20" y="30" fontSize="6.5" fontWeight="400" fill="#FFFFFF" textAnchor="middle" letterSpacing="0.8" fontFamily="sans-serif">
          TATA
        </text>
      </svg>
    </div>
  );
}

function AfconsLogo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded-lg bg-black text-white shrink-0 ${className}`}>
      <svg viewBox="0 0 40 40" className="h-5 w-5" fill="none">
        <polygon points="20,5 33,12 33,28 20,35 7,28 7,12" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
        <path d="M 14 26 L 20 13 L 26 26" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="16" y1="22" x2="24" y2="22" stroke="#FFFFFF" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

function ShapoorjiLogo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded-lg bg-black text-white shrink-0 ${className}`}>
      <svg viewBox="0 0 40 40" className="h-5 w-5" fill="none">
        <rect x="6" y="6" width="28" height="28" rx="5" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
        <text x="20" y="24" fontSize="12" fontWeight="400" fill="#FFFFFF" textAnchor="middle" letterSpacing="0.5" fontFamily="sans-serif">
          SP
        </text>
      </svg>
    </div>
  );
}

function DilipLogo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded-lg bg-black text-white shrink-0 ${className}`}>
      <svg viewBox="0 0 40 40" className="h-5 w-5" fill="none">
        <path d="M 8 30 Q 15 10 32 10" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M 12 32 Q 22 18 32 18" stroke="#FFFFFF" strokeWidth="1.2" strokeDasharray="2,2" fill="none" />
        <text x="20" y="32" fontSize="6.5" fontWeight="400" fill="#FFFFFF" textAnchor="middle" letterSpacing="0.8" fontFamily="sans-serif">
          DBL
        </text>
      </svg>
    </div>
  );
}

function NCCLogo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded-lg bg-black text-white shrink-0 ${className}`}>
      <svg viewBox="0 0 40 40" className="h-5 w-5" fill="none">
        <polygon points="6,10 20,4 34,10 34,30 20,36 6,30" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
        <text x="20" y="24" fontSize="8.5" fontWeight="400" fill="#FFFFFF" textAnchor="middle" fontFamily="sans-serif">
          NCC
        </text>
      </svg>
    </div>
  );
}

function ClientLogo({ name, className = 'h-8 w-8' }: { name: string; className?: string }) {
  const n = (name || '').toLowerCase();
  if (n.includes('l&t') || n.includes('larsen')) return <LTLogo className={className} />;
  if (n.includes('tata')) return <TataLogo className={className} />;
  if (n.includes('afcon')) return <AfconsLogo className={className} />;
  if (n.includes('shapoorji') || n.includes('sp')) return <ShapoorjiLogo className={className} />;
  if (n.includes('dilip') || n.includes('dbl')) return <DilipLogo className={className} />;
  if (n.includes('ncc')) return <NCCLogo className={className} />;
  return (
    <div className={`flex items-center justify-center rounded-lg bg-black text-white shrink-0 ${className}`}>
      <Building2 className="h-4 w-4 text-white" />
    </div>
  );
}

export default function OwnerClients() {
  const router = useRouter();
  const cachedClients = getCachedList<ClientEntry>('/api/v1/clients');
  const [clients, setClients] = useState<ClientEntry[]>(() => cachedClients ?? []);
  const [loading, setLoading] = useState<boolean>(() => !cachedClients || cachedClients.length === 0);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'net30' | 'net45'>('all');

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
      const name = String(c.name ?? '').trim();
      if (!name || seen.has(name.toLowerCase())) return false;
      seen.add(name.toLowerCase());
      return true;
    });
  }, [clients]);

  const activeClients = uniqueClients.filter((c) => c.status === 'active').length;
  const totalRevenue = uniqueClients.reduce((sum, c) => sum + (c.total_revenue ?? 0), 0);
  const avgTerms = useMemo(() => {
    if (!uniqueClients.length) return 30;
    const sum = uniqueClients.reduce((acc, c) => acc + (c.payment_terms_days ?? 30), 0);
    return Math.round(sum / uniqueClients.length);
  }, [uniqueClients]);

  const filteredClients = useMemo(() => {
    return uniqueClients.filter((c) => {
      // Filter tab
      if (statusFilter === 'active' && c.status !== 'active') return false;
      if (statusFilter === 'net30' && (c.payment_terms_days ?? 30) !== 30) return false;
      if (statusFilter === 'net45' && (c.payment_terms_days ?? 30) < 45) return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.contact_person && c.contact_person.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q))
      );
    });
  }, [uniqueClients, searchQuery, statusFilter]);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-normal text-black">Clients</h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-normal border border-zinc-300 bg-zinc-100 text-black">
              <Building2 className="h-3 w-3" />
              <span className="font-normal">{uniqueClients.length} Enterprise</span>
            </span>
          </div>
          <p className="text-xs font-normal text-black/70 mt-0.5">
            Manage your client relationships, contract terms, active project sites, and billing milestones
          </p>
        </div>

        <Link href="/clients/new">
          <Button className="bg-black hover:bg-zinc-800 text-white font-normal shadow-sm h-9 px-3.5 text-xs">
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Client
          </Button>
        </Link>
      </div>

      {/* Overview Metric Boxes - Box Shaped, Perfectly Aligned */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Box 1: Total Clients */}
        <div className="rounded-2xl border border-zinc-300 bg-white p-5 sm:p-6 flex flex-col justify-between min-h-[150px] sm:min-h-[160px] hover:border-black transition-all shadow-xs">
          <div className="flex items-center justify-between h-5">
            <span className="text-xs font-medium text-black uppercase tracking-wider">Total Clients</span>
            <LTLogo className="h-6 w-6 shrink-0 rounded-md" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold tracking-tight text-black">{uniqueClients.length}</span>
              <span className="text-xs font-normal text-zinc-600">registered</span>
            </div>
          </div>
        </div>

        {/* Box 2: Active Clients */}
        <div className="rounded-2xl border border-zinc-300 bg-white p-5 sm:p-6 flex flex-col justify-between min-h-[150px] sm:min-h-[160px] hover:border-black transition-all shadow-xs">
          <div className="flex items-center justify-between h-5">
            <span className="text-xs font-medium text-black uppercase tracking-wider">Active Clients</span>
            <TataLogo className="h-6 w-6 shrink-0 rounded-md" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold tracking-tight text-black">{activeClients}</span>
              <span className="text-xs font-normal text-zinc-600">contracts</span>
            </div>
          </div>
        </div>

        {/* Box 3: Cumulative Revenue */}
        <div className="rounded-2xl border border-zinc-300 bg-white p-5 sm:p-6 flex flex-col justify-between min-h-[150px] sm:min-h-[160px] hover:border-black transition-all shadow-xs">
          <div className="flex items-center justify-between h-5">
            <span className="text-xs font-medium text-black uppercase tracking-wider">Cumulative Revenue</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-black text-white shrink-0">
              <IndianRupee className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
                ₹{(totalRevenue / 10000000).toFixed(1)} Cr
              </span>
              <span className="text-xs font-normal text-zinc-600">lifetime</span>
            </div>
          </div>
        </div>

        {/* Box 4: Avg Payment Terms */}
        <div className="rounded-2xl border border-zinc-300 bg-white p-5 sm:p-6 flex flex-col justify-between min-h-[150px] sm:min-h-[160px] hover:border-black transition-all shadow-xs">
          <div className="flex items-center justify-between h-5">
            <span className="text-xs font-medium text-black uppercase tracking-wider">Avg Payment Terms</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-black text-white shrink-0">
              <Clock className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold tracking-tight text-black">{avgTerms}</span>
              <span className="text-xs font-normal text-zinc-600">days net</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Quick Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/40" />
          <input
            type="text"
            placeholder="Search client, contact, email, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-300 bg-white text-black placeholder:text-black/40 focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-normal transition-colors border ${
              statusFilter === 'all'
                ? 'border-black bg-black text-white'
                : 'border-zinc-300 bg-white text-black hover:bg-zinc-100'
            }`}
          >
            All ({uniqueClients.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-2.5 py-1 rounded-md text-xs font-normal transition-colors border ${
              statusFilter === 'active'
                ? 'border-black bg-black text-white'
                : 'border-zinc-300 bg-white text-black hover:bg-zinc-100'
            }`}
          >
            Active ({activeClients})
          </button>
          <button
            onClick={() => setStatusFilter('net30')}
            className={`px-2.5 py-1 rounded-md text-xs font-normal transition-colors border ${
              statusFilter === 'net30'
                ? 'border-black bg-black text-white'
                : 'border-zinc-300 bg-white text-black hover:bg-zinc-100'
            }`}
          >
            Net 30d
          </button>
          <button
            onClick={() => setStatusFilter('net45')}
            className={`px-2.5 py-1 rounded-md text-xs font-normal transition-colors border ${
              statusFilter === 'net45'
                ? 'border-black bg-black text-white'
                : 'border-zinc-300 bg-white text-black hover:bg-zinc-100'
            }`}
          >
            Net 45d+
          </button>
        </div>
      </div>

      {/* Small Boxes Grid - 3 Columns, Compact Heights, Solid Black Font, Unbolded */}
      {loading ? (
        <div className="grid gap-3.5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-zinc-200 bg-white p-4 h-52 animate-pulse space-y-3"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-zinc-200 rounded-lg shrink-0" />
                <div className="h-4 bg-zinc-200 rounded w-3/4" />
              </div>
              <div className="h-3 bg-zinc-200 rounded w-1/2" />
              <div className="h-16 bg-zinc-100 rounded-lg" />
              <div className="h-3 bg-zinc-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="rounded-xl border border-zinc-300 bg-white p-8 text-center">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Building2 className="h-7 w-7 text-black/50" />
              </EmptyMedia>
              <EmptyTitle className="text-black font-normal mt-2 text-sm">No clients found</EmptyTitle>
              <EmptyDescription className="text-black/60 font-normal text-xs">
                {searchQuery
                  ? 'No clients matched your search query. Try clearing the search box.'
                  : 'Add your first contractor client to begin managing sites and deployments.'}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="mt-3">
              {searchQuery ? (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery('')}
                  className="font-normal text-xs text-black border-zinc-300"
                >
                  Clear Search
                </Button>
              ) : (
                <Link href="/clients/new">
                  <Button className="bg-black hover:bg-zinc-800 text-white font-normal text-xs">
                    + Add Client
                  </Button>
                </Link>
              )}
            </EmptyContent>
          </Empty>
        </div>
      ) : (
        <div className="grid gap-3.5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((c) => {
            const revenueInCr = ((c.total_revenue ?? 0) / 10000000).toFixed(1);
            const terms = c.payment_terms_days ?? 30;

            return (
              <div
                key={c.id}
                className="group relative flex flex-col justify-between rounded-xl border border-zinc-300 bg-white hover:border-black transition-all duration-200 p-4 shadow-sm"
              >
                <div>
                  {/* Card Header: Brand Logo, Client Name, Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ClientLogo name={c.name} className="h-8 w-8" />
                      <div className="min-w-0">
                        <Link
                          href={`/clients/${c.id}`}
                          className="text-sm font-normal text-black truncate tracking-tight hover:underline block"
                        >
                          {c.name}
                        </Link>
                        <p className="text-xs font-normal text-black/70 truncate mt-0.5">
                          {c.contact_person || 'Enterprise Contractor'}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-normal border border-zinc-300 bg-zinc-50 text-black">
                      <span className="h-1.5 w-1.5 rounded-full bg-black" />
                      {c.status || 'Active'}
                    </span>
                  </div>

                  {/* Compact Contact & Location Rows */}
                  <div className="mt-3 space-y-1.5 text-xs text-black/75">
                    {c.phone && (
                      <div className="flex items-center gap-2 truncate">
                        <Phone className="h-3.5 w-3.5 text-black shrink-0" />
                        <span className="font-normal text-black truncate">{c.phone}</span>
                      </div>
                    )}
                    {c.email && (
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="h-3.5 w-3.5 text-black shrink-0" />
                        <span className="font-normal text-black truncate">{c.email}</span>
                      </div>
                    )}
                    {c.address && (
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="h-3.5 w-3.5 text-black shrink-0" />
                        <span className="font-normal text-black/80 truncate text-[11px]">
                          {c.address}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Creative Mini Metric Ribbon: Projects, Revenue, Terms */}
                  <div className="mt-3 p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div>
                        <p className="text-[10px] font-normal text-black/60 uppercase tracking-wider">
                          Projects
                        </p>
                        <p className="text-xs font-normal text-black mt-0.5">
                          {c.total_projects ?? 0} Active
                        </p>
                      </div>
                      <div className="h-5 w-[1px] bg-zinc-200" />
                      <div>
                        <p className="text-[10px] font-normal text-black/60 uppercase tracking-wider">
                          Revenue
                        </p>
                        <p className="text-xs font-normal text-black mt-0.5">
                          ₹{revenueInCr} Cr
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-normal border border-zinc-300 bg-white text-black">
                        Net {terms}d
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Navigation & Actions */}
                <div className="mt-3.5 pt-2.5 border-t border-zinc-200 flex items-center justify-between">
                  <Link
                    href={`/clients/${c.id}`}
                    className="inline-flex items-center gap-1 text-xs font-normal text-black hover:underline"
                  >
                    <span>View client</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => router.push(`/clients/${c.id}`)}
                      className="p-1 rounded-md text-black/60 hover:text-black hover:bg-zinc-100 transition-colors"
                      title="Edit Client"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>

                    <BorderButton
                      size="sm"
                      tone="destructive"
                      title="Delete Client"
                      aria-label="Delete"
                      onClick={() => void handleDelete(c.id, c.name)}
                      className="h-6 w-6 p-0 flex items-center justify-center"
                    >
                      <Trash2 aria-hidden="true" className="h-3 w-3 text-red-600" />
                    </BorderButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete client"
        desc={`Are you sure you want to delete "${deleteTarget?.label}"? This action cannot be undone.`}
        confirmText="Delete"
        destructive
        isLoading={deleting}
        handleConfirm={() => {
          void confirmDeleteClient();
        }}
      />
    </div>
  );
}
