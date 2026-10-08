'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings as SettingsIcon, Users, Truck, Tag, DollarSign, Camera, Bell, Clock, Globe, Shield, Wrench, CheckCircle } from 'lucide-react';
import { fetchListStrict } from '@/lib/api/fetch-list';
import { useAuth } from '@/lib/auth/context';
import { UserActions } from '@/components/users/user-actions';
import { authFetch } from '@/lib/api/auth-fetch';
import { useLocale, type Locale } from '@/components/i18n-provider';
import { ApiErrorBanner } from '@/components/api-error-banner';
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { ConfigActions } from '@/components/records/config-actions';

interface TenantSettings {
  evidence_policy: Record<string, string>;
  fx_defaults: Record<string, { currency: string; rate: number }>;
  cut_off_time: string;
  working_units_per_day: number;
  working_days_per_month: number;
}

const TAB_CONFIG = [
  { id: 'users', label: 'Users', icon: Users, color: 'from-zinc-900 to-zinc-800' },
  { id: 'machines', label: 'Machines', icon: Truck, color: 'from-zinc-900 to-zinc-800' },
  { id: 'categories', label: 'Categories', icon: Tag, color: 'from-zinc-900 to-zinc-800' },
  { id: 'fx', label: 'FX', icon: DollarSign, color: 'from-zinc-900 to-zinc-800' },
  { id: 'evidence', label: 'Evidence', icon: Camera, color: 'from-zinc-900 to-zinc-800' },
  { id: 'thresholds', label: 'Thresholds', icon: Shield, color: 'from-zinc-900 to-zinc-800' },
  { id: 'notifications', label: 'Notifications', icon: Bell, color: 'from-zinc-900 to-zinc-800' },
  { id: 'periodClose', label: 'Period Close', icon: Clock, color: 'from-zinc-900 to-zinc-800' },
  { id: 'language', label: 'Language', icon: Globe, color: 'from-zinc-900 to-zinc-800' },
] as const;

/**
 * Mirrors the `alert_rules_rule_type_check` constraint in `tenant.alert_rules`.
 * The DB rejects anything outside this list with 23514, which the API turns
 * into a 400 — offering the same set here means a user never sees that.
 */
const RULE_TYPES = [
  'maintenance_warning',
  'maintenance_overdue',
  'payment_due',
  'payment_overdue',
  'log_pending',
  'diesel_anomaly',
  'cash_variance',
  'duplicate_expense',
  'concentration',
  'ocr_mismatch',
  'auto_hold',
] as const;

export default function Settings() {
  const { locale, setLocale } = useLocale();
  const { user } = useAuth();
  const [tab, setTab] = useState<'users' | 'machines' | 'categories' | 'fx' | 'evidence' | 'thresholds' | 'notifications' | 'periodClose' | 'language'>('users');
  const [periodClosePeriod, setPeriodClosePeriod] = useState('');
  const [periodCloseNote, setPeriodCloseNote] = useState('');
  const [periodCloses, setPeriodCloses] = useState<Array<Record<string, unknown>>>([]);
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [machines, setMachines] = useState<Record<string, unknown>[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState<Record<string, unknown>[]>([]);
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [fxCurrencies, setFxCurrencies] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(false);

  // Invite flow: POST /users/invite returns a one-time invite_token that the
  // invitee redeems at /accept-invite to set their own password.
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('ops');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  // Config CRUD: expense categories, maintenance tasks and alert rules are
  // read-only or absent elsewhere in the product, so Settings is where they
  // are added, renamed and removed.
  const [newCategory, setNewCategory] = useState('');
  const [categoryBusy, setCategoryBusy] = useState(false);
  const [configError, setConfigError] = useState('');
  const [taskForm, setTaskForm] = useState({
    name: '',
    machine_id: '',
    trigger: 'calendar',
    interval_value: '',
    warning_value: '',
  });
  const [taskBusy, setTaskBusy] = useState(false);
  const [alertRules, setAlertRules] = useState<Record<string, unknown>[]>([]);
  const [ruleForm, setRuleForm] = useState({
    rule_type: 'maintenance_warning',
    threshold: '',
    threshold_unit: '',
  });
  const [ruleBusy, setRuleBusy] = useState(false);

  const reloadUsers = async () => {
    try {
      setUsers(await fetchListStrict<Record<string, unknown>>('/api/v1/users'));
    } catch {
      setConfigError('Could not reload users — the API is unreachable.');
    }
  };

  const reloadConfig = async () => {
    try {
      const [mt, c, ar] = await Promise.all([
        fetchListStrict<Record<string, unknown>>('/api/v1/maintenance/tasks'),
        fetchListStrict<Record<string, unknown>>('/api/v1/expenses/categories'),
        fetchListStrict<Record<string, unknown>>('/api/v1/alerts/rules'),
      ]);
      setMaintenanceTasks(mt);
      setCategories(c);
      setAlertRules(ar);
    } catch {
      setConfigError('Could not reload — the API is unreachable.');
    }
  };

  const createRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setRuleBusy(true);
    setConfigError('');
    try {
      const res = await authFetch('/api/v1/alerts/rules', {
        method: 'POST',
        body: JSON.stringify({
          rule_type: ruleForm.rule_type,
          threshold: ruleForm.threshold === '' ? null : Number(ruleForm.threshold),
          threshold_unit: ruleForm.threshold_unit || null,
          is_active: true,
          client_uuid: crypto.randomUUID(),
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setConfigError(body?.message || 'Could not add that rule.');
        return;
      }
      setRuleForm({ rule_type: 'maintenance_warning', threshold: '', threshold_unit: '' });
      await reloadConfig();
    } catch {
      setConfigError('Could not add that rule — the API is unreachable.');
    } finally {
      setRuleBusy(false);
    }
  };

  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCategory.trim();
    if (!name) return;
    setCategoryBusy(true);
    setConfigError('');
    try {
      const res = await authFetch('/api/v1/expenses/categories', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setConfigError(body?.message || 'Could not add that category.');
        return;
      }
      setNewCategory('');
      await reloadConfig();
    } catch {
      setConfigError('Could not add that category — the API is unreachable.');
    } finally {
      setCategoryBusy(false);
    }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setTaskBusy(true);
    setConfigError('');
    try {
      const res = await authFetch('/api/v1/maintenance/tasks', {
        method: 'POST',
        body: JSON.stringify({
          name: taskForm.name.trim(),
          machine_id: taskForm.machine_id,
          trigger: taskForm.trigger,
          interval_value: Number(taskForm.interval_value),
          warning_value: taskForm.warning_value === '' ? null : Number(taskForm.warning_value),
          client_uuid: crypto.randomUUID(),
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setConfigError(body?.message || 'Could not add that task.');
        return;
      }
      setTaskForm({ name: '', machine_id: '', trigger: 'calendar', interval_value: '', warning_value: '' });
      await reloadConfig();
    } catch {
      setConfigError('Could not add that task — the API is unreachable.');
    } finally {
      setTaskBusy(false);
    }
  };

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');
    setInviteLink('');
    setCopied(false);

    if (invitePassword && invitePassword.length < 8) {
      setInviteError('Password must be at least 8 characters, or leave it blank.');
      return;
    }

    setInviteBusy(true);
    try {
      const res = await authFetch('/api/v1/users/invite', {
        method: 'POST',
        body: JSON.stringify({
          email: inviteEmail.trim(),
          name: inviteName.trim() || inviteEmail.trim(),
          role: inviteRole,
          ...(invitePassword ? { password: invitePassword } : {}),
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setInviteError(body?.detail || 'Invite failed');
        return;
      }
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      setInviteLink(body?.invite_token
        ? `${origin}/accept-invite?token=${encodeURIComponent(body.invite_token)}`
        : '');
      setInviteEmail('');
      setInviteName('');
      setInvitePassword('');
      const fresh = await fetchListStrict<Record<string, unknown>>('/api/v1/users');
      setUsers(fresh);
    } catch {
      setInviteError('Invite failed — the API is unreachable.');
    } finally {
      setInviteBusy(false);
    }
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  useEffect(() => {
    setApiError(false);
    void Promise.all([
      fetchListStrict<Record<string, unknown>>('/api/v1/users'),
      fetchListStrict<Record<string, unknown>>('/api/v1/machines'),
      fetchListStrict<Record<string, unknown>>('/api/v1/maintenance/tasks'),
      fetchListStrict<Record<string, unknown>>('/api/v1/expenses/categories'),
      fetchListStrict<Record<string, unknown>>('/api/v1/alerts/rules'),
      authFetch('/api/v1/tenants/settings').then(r => r.ok ? r.json() : null).catch(() => null),
      fetchListStrict<Record<string, unknown>>('/api/v1/tenants/period-closes'),
    ]).then(([u, m, mt, c, ar, s, pc]) => {
      // API up → show exactly what's in the DB (empty = empty state)
      setUsers(u);
      setMachines(m);
      setMaintenanceTasks(mt);
      setCategories(c);
      setAlertRules(ar);
      setPeriodCloses(pc);
      if (s) {
        setSettings(s);
        const rates: Record<string, string> = {};
        if (s.fx_defaults && typeof s.fx_defaults === 'object') {
          Object.entries(s.fx_defaults).forEach(([k, v]) => {
            rates[k] = String((v as { rate: number }).rate ?? v);
          });
        }
        setFxCurrencies(rates);
      } else {
        // Settings row missing — surface the banner, leave tabs empty
        setApiError(true);
      }
    }).catch(() => {
      // API down → banner only, never fake users/machines/categories
      setApiError(true);
    }).finally(() => setLoading(false));
  }, []);

  const saveSettings = async (updates: Partial<TenantSettings>) => {
    setSaving(true);
    setSaveError('');
    try {
      const res = await authFetch('/api/v1/tenants/settings', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSettings(prev => prev ? { ...prev, ...updates } : prev);
    } catch {
      setSaveError('Settings could not be saved — changes were not applied.');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-5">
      {apiError && <ApiErrorBanner />}
      <div>
        <h1 className="text-3xl font-normal text-black">Settings</h1>
        <p className="text-xs font-normal text-black mt-1">Tenant configuration, permissions and operational rules</p>
      </div>
      {saveError && <p className="text-xs font-normal text-black">{saveError}</p>}

      {/* ── Compact Metric Boxes with Images ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Box 1: Users */}
        <div className="relative overflow-hidden rounded-xl border border-zinc-300 bg-white p-3.5 flex items-center justify-between">
          <div className="space-y-1 z-10 min-w-0 pr-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-normal uppercase tracking-wider text-black">Workspace</span>
              <span className="rounded border border-zinc-300 bg-zinc-50 px-1 py-0.2 text-[9px] font-normal text-black">Team</span>
            </div>
            <p className="text-xl font-normal text-black leading-tight">{users.length}</p>
            <p className="text-[11px] font-normal text-black truncate">Active Members</p>
          </div>
          <div className="relative h-12 w-12 shrink-0 rounded-lg border border-zinc-300 overflow-hidden bg-zinc-100">
            <img
              src="/operators/op-001.jpg"
              alt="Users"
              className="h-full w-full object-cover grayscale contrast-125"
            />
          </div>
        </div>

        {/* Box 2: Machines */}
        <div className="relative overflow-hidden rounded-xl border border-zinc-300 bg-white p-3.5 flex items-center justify-between">
          <div className="space-y-1 z-10 min-w-0 pr-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-normal uppercase tracking-wider text-black">Heavy Units</span>
              <span className="rounded border border-zinc-300 bg-zinc-50 px-1 py-0.2 text-[9px] font-normal text-black">Fleet</span>
            </div>
            <p className="text-xl font-normal text-black leading-tight">{machines.length}</p>
            <p className="text-[11px] font-normal text-black truncate">Registered Fleet</p>
          </div>
          <div className="relative h-12 w-12 shrink-0 rounded-lg border border-zinc-300 overflow-hidden bg-zinc-100">
            <img
              src="/fleet/exc-01.jpg"
              alt="Machines"
              className="h-full w-full object-cover grayscale contrast-125"
            />
          </div>
        </div>

        {/* Box 3: Closed Periods */}
        <div className="relative overflow-hidden rounded-xl border border-zinc-300 bg-white p-3.5 flex items-center justify-between">
          <div className="space-y-1 z-10 min-w-0 pr-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-normal uppercase tracking-wider text-black">Audit Cycles</span>
              <span className="rounded border border-zinc-300 bg-zinc-50 px-1 py-0.2 text-[9px] font-normal text-black">Fiscal</span>
            </div>
            <p className="text-xl font-normal text-black leading-tight">{periodCloses.length}</p>
            <p className="text-[11px] font-normal text-black truncate">Closed Periods</p>
          </div>
          <div className="relative h-12 w-12 shrink-0 rounded-lg border border-zinc-300 overflow-hidden bg-zinc-100">
            <img
              src="/fleet/dzr-01.jpg"
              alt="Periods"
              className="h-full w-full object-cover grayscale contrast-125"
            />
          </div>
        </div>
      </div>

      {/* ── Compact Tab Navigation ── */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 border-b border-zinc-200">
        {TAB_CONFIG.map((tabConfig) => {
          const Icon = tabConfig.icon;
          const isActive = tab === tabConfig.id;
          return (
            <button
              key={tabConfig.id}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-normal whitespace-nowrap transition-colors border ${
                isActive 
                  ? 'bg-zinc-100 border-black text-black' 
                  : 'bg-white border-zinc-300 text-black hover:border-black'
              }`}
              onClick={() => setTab(tabConfig.id)}
            >
              <Icon className="h-3.5 w-3.5 text-black" />
              {tabConfig.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {tab === 'users' && (
            <Card className="overflow-hidden rounded-xl border border-zinc-300 bg-white p-0 shadow-none">
              <div className="flex items-center gap-2 border-b border-zinc-200 px-5 py-3">
                <Users className="h-4 w-4 text-black" />
                <CardTitle className="text-sm font-normal text-black">
                  User Management
                </CardTitle>
              </div>
              <CardContent className="p-5 space-y-5">
                <form onSubmit={(e) => { void sendInvite(e); }} className="space-y-3 rounded-lg border border-zinc-300 p-3.5 bg-zinc-50">
                  <div>
                    <h3 className="text-xs font-normal text-black">Invite a teammate</h3>
                    <p className="text-[11px] font-normal text-black mt-0.5">
                      They set their own password with the invite link — they&rsquo;ll share this workspace&rsquo;s data with you.
                    </p>
                  </div>

                  {inviteError && <p className="text-xs font-normal text-black">{inviteError}</p>}

                  <div className="grid gap-2.5 sm:grid-cols-3">
                    <Input
                      type="email"
                      required
                      placeholder="teammate@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      aria-label="Teammate email"
                      className="border-zinc-300 text-xs font-normal text-black"
                    />
                    <Input
                      placeholder="Full name"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      aria-label="Teammate name"
                      className="border-zinc-300 text-xs font-normal text-black"
                    />
                    <NativeSelect
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      aria-label="Role"
                      className="border-zinc-300 text-xs font-normal text-black"
                    >
                      <NativeSelectOption value="ops">Role: Operator</NativeSelectOption>
                      <NativeSelectOption value="owner">Role: Owner</NativeSelectOption>
                    </NativeSelect>
                  </div>

                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <Input
                      type="password"
                      placeholder="Optional: set their password now"
                      value={invitePassword}
                      onChange={(e) => setInvitePassword(e.target.value)}
                      aria-label="Optional password"
                      minLength={8}
                      className="border-zinc-300 text-xs font-normal text-black"
                    />
                    <Button type="submit" disabled={inviteBusy} className="text-xs font-normal text-black bg-zinc-100 hover:bg-zinc-200 border border-zinc-300">
                      {inviteBusy ? <Spinner className="mr-2" /> : null}
                      {inviteBusy ? 'Sending…' : 'Send invite'}
                    </Button>
                  </div>

                  {inviteLink && (
                    <div className="rounded border border-zinc-300 bg-white p-2.5 space-y-2">
                      <p className="text-xs font-normal text-black">Share this link with them (valid for 7 days):</p>
                      <div className="flex gap-2">
                        <Input readOnly value={inviteLink} className="text-xs font-normal text-black border-zinc-300" aria-label="Invite link" />
                        <Button type="button" variant="outline" size="sm" onClick={() => { void copyInviteLink(); }} className="text-xs font-normal text-black border-zinc-300">
                          {copied ? 'Copied' : 'Copy'}
                        </Button>
                      </div>
                      <p className="text-[11px] font-normal text-black">
                        Works from <code>/accept-invite</code> — they choose their own password and land signed in.
                      </p>
                    </div>
                  )}
                </form>

                <ItemGroup className="gap-2">
                  {users.map((u: Record<string, unknown>, idx: number) => {
                    const avatarNum = (idx % 6) + 1;
                    return (
                      <Item key={u.id as string} variant="outline" className="border-zinc-300 p-2.5 rounded-lg">
                        <ItemMedia className="size-9 rounded-lg border border-zinc-300 overflow-hidden bg-zinc-100 shrink-0">
                          <img
                            src={`/operators/op-00${avatarNum}.jpg`}
                            alt="Avatar"
                            className="h-full w-full object-cover grayscale contrast-125"
                          />
                        </ItemMedia>
                        <ItemContent>
                          <ItemTitle className="text-xs font-normal text-black">{u.email as string}</ItemTitle>
                          <ItemDescription className="text-[11px] font-normal text-black">{u.role as string}</ItemDescription>
                        </ItemContent>
                        <ItemActions className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded border border-zinc-300 bg-zinc-50 text-[11px] font-normal text-black">
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <UserActions
                            user={u}
                            isSelf={String(u.id) === String(user?.id ?? '')}
                            onChanged={() => void reloadUsers()}
                          />
                        </ItemActions>
                      </Item>
                    );
                  })}
                </ItemGroup>
              </CardContent>
            </Card>
          )}

          {tab === 'machines' && (
            <div className="space-y-5">
              <Card className="overflow-hidden rounded-xl border border-zinc-300 bg-white p-0 shadow-none">
                <div className="flex items-center gap-2 border-b border-zinc-200 px-5 py-3">
                  <Truck className="h-4 w-4 text-black" />
                  <CardTitle className="text-sm font-normal text-black">
                    Machine Configuration
                  </CardTitle>
                </div>
                <CardContent className="p-5">
                  <ItemGroup className="gap-2">
                    {machines.map((m: Record<string, unknown>) => {
                      const code = String(m.code ?? '').toLowerCase();
                      const machineThumb = code.includes('exc-02')
                        ? '/fleet/exc-02.jpg'
                        : code.includes('dzr')
                        ? '/fleet/dzr-01.jpg'
                        : code.includes('dtr-02')
                        ? '/fleet/dtr-02.jpg'
                        : code.includes('dtr')
                        ? '/fleet/dtr-01.jpg'
                        : '/fleet/exc-01.jpg';

                      return (
                        <Item key={m.id as string} variant="outline" className="border-zinc-300 p-2.5 rounded-lg">
                          <ItemMedia className="size-9 rounded-lg border border-zinc-300 overflow-hidden bg-zinc-100 shrink-0">
                            <img
                              src={machineThumb}
                              alt={String(m.code)}
                              className="h-full w-full object-cover grayscale contrast-125"
                            />
                          </ItemMedia>
                          <ItemContent>
                            <ItemTitle className="text-xs font-normal text-black">{m.code as string}</ItemTitle>
                            <ItemDescription className="text-[11px] font-normal text-black">{m.type as string}</ItemDescription>
                          </ItemContent>
                          <ItemActions>
                            <span className="text-xs font-normal text-black border border-zinc-300 bg-zinc-50 px-2 py-0.5 rounded">
                              {m.current_meter as number} {(m.meter_unit_label || m.primary_meter_type || 'hrs') as string}
                            </span>
                          </ItemActions>
                        </Item>
                      );
                    })}
                  </ItemGroup>
                  {machines.length === 0 && (
                    <Empty className="py-6">
                      <EmptyHeader>
                        <EmptyMedia variant="icon"><Truck className="h-6 w-6 text-black" /></EmptyMedia>
                        <EmptyTitle className="text-xs font-normal text-black">No machines configured yet</EmptyTitle>
                        <EmptyDescription className="text-[11px] font-normal text-black">Machines you add will show up here.</EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )}
                </CardContent>
              </Card>

              <Card className="overflow-hidden rounded-xl border border-zinc-300 bg-white p-0 shadow-none">
                <div className="flex items-center gap-2 border-b border-zinc-200 px-5 py-3">
                  <Wrench className="h-4 w-4 text-black" />
                  <CardTitle className="text-sm font-normal text-black">
                    Maintenance Tasks
                  </CardTitle>
                </div>
                <CardContent className="p-5">
                  <form
                    onSubmit={(e) => void createTask(e)}
                    className="mb-4 grid gap-2.5 rounded-lg border border-zinc-300 bg-zinc-50 p-3.5 sm:grid-cols-2"
                  >
                    <div>
                      <label className="text-xs font-normal text-black">Task name *</label>
                      <Input
                        value={taskForm.name}
                        onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
                        placeholder="Oil change"
                        required
                        className="mt-1 border-zinc-300 text-xs font-normal text-black"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-normal text-black">Machine *</label>
                      <NativeSelect
                        value={taskForm.machine_id}
                        onChange={(e) => setTaskForm({ ...taskForm, machine_id: e.target.value })}
                        required
                        className="mt-1 border-zinc-300 text-xs font-normal text-black"
                      >
                        <NativeSelectOption value="">Select machine…</NativeSelectOption>
                        {machines.map((m) => (
                          <NativeSelectOption key={m.id as string} value={m.id as string}>
                            {m.code as string}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </div>
                    <div>
                      <label className="text-xs font-normal text-black">Repeat every *</label>
                      <Input
                        type="number"
                        min={1}
                        step="any"
                        value={taskForm.interval_value}
                        onChange={(e) => setTaskForm({ ...taskForm, interval_value: e.target.value })}
                        placeholder="250"
                        required
                        className="mt-1 border-zinc-300 text-xs font-normal text-black"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-normal text-black">Counted in</label>
                      <NativeSelect
                        value={taskForm.trigger}
                        onChange={(e) => setTaskForm({ ...taskForm, trigger: e.target.value })}
                        className="mt-1 border-zinc-300 text-xs font-normal text-black"
                      >
                        <NativeSelectOption value="calendar">Days</NativeSelectOption>
                        <NativeSelectOption value="meter">Meter hours</NativeSelectOption>
                      </NativeSelect>
                    </div>
                    <div>
                      <label className="text-xs font-normal text-black">Warn at</label>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        value={taskForm.warning_value}
                        onChange={(e) => setTaskForm({ ...taskForm, warning_value: e.target.value })}
                        placeholder="e.g. 50 before due"
                        className="mt-1 border-zinc-300 text-xs font-normal text-black"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="submit"
                        disabled={taskBusy || !taskForm.name.trim() || !taskForm.machine_id || !taskForm.interval_value}
                        className="text-xs font-normal text-black bg-zinc-100 hover:bg-zinc-200 border border-zinc-300"
                      >
                        {taskBusy ? 'Adding…' : 'Add task'}
                      </Button>
                    </div>
                  </form>

                  <ItemGroup className="gap-2">
                    {maintenanceTasks.map((task: Record<string, unknown>) => (
                      <Item key={task.id as string} variant="outline" className="border-zinc-300 p-2.5 rounded-lg">
                        <ItemContent>
                          <ItemTitle className="text-xs font-normal text-black">{task.name as string}</ItemTitle>
                          <ItemDescription className="text-[11px] font-normal text-black">
                            {task.trigger as string === 'meter' ? `Every ${task.interval_value as number} hours` : `Every ${task.interval_value as number} days`}
                          </ItemDescription>
                        </ItemContent>
                        <ItemActions className="flex items-center gap-2">
                          <span className="text-xs font-normal text-black border border-zinc-300 bg-zinc-50 px-2 py-0.5 rounded">
                            Warning: {task.warning_value as number}
                          </span>
                          <ConfigActions
                            path="maintenance/tasks"
                            row={task}
                            label="maintenance task"
                            fields={['name', 'machine_id', 'trigger', 'interval_value', 'warning_value']}
                            options={{
                              machine_id: machines.map((m) => ({ value: String(m.id), label: String(m.code) })),
                              trigger: [
                                { value: 'calendar', label: 'Days' },
                                { value: 'meter', label: 'Meter hours' },
                              ],
                            }}
                            onChanged={() => void reloadConfig()}
                          />
                        </ItemActions>
                      </Item>
                    ))}
                  </ItemGroup>
                  {maintenanceTasks.length === 0 && (
                    <Empty className="py-6">
                      <EmptyHeader>
                        <EmptyMedia variant="icon"><Wrench /></EmptyMedia>
                        <EmptyTitle>No maintenance tasks configured</EmptyTitle>
                        <EmptyDescription>Service intervals you define will appear here.</EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {tab === 'categories' && (
            <Card className="overflow-hidden rounded-xl border border-zinc-300 bg-white p-0 shadow-none">
              <div className="flex items-center gap-2 border-b border-zinc-200 px-5 py-3">
                <Tag className="h-4 w-4 text-black" />
                <CardTitle className="text-sm font-normal text-black">
                  Expense Categories
                </CardTitle>
              </div>
              <CardContent className="p-5">
                <form onSubmit={(e) => void createCategory(e)} className="mb-4 flex flex-wrap items-end gap-2.5 rounded-lg border border-zinc-300 bg-zinc-50 p-3.5">
                  <div className="min-w-56 flex-1">
                    <label className="text-xs font-normal text-black">New category *</label>
                    <Input
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Spare parts"
                      required
                      className="mt-1 border-zinc-300 text-xs font-normal text-black"
                    />
                  </div>
                  <Button type="submit" disabled={categoryBusy || !newCategory.trim()} className="text-xs font-normal text-black bg-zinc-100 hover:bg-zinc-200 border border-zinc-300">
                    {categoryBusy ? 'Adding…' : 'Add category'}
                  </Button>
                </form>

                {configError && <p className="mb-3 text-xs font-normal text-black">{configError}</p>}

                <ItemGroup className="gap-2">
                  {categories.map((c: Record<string, unknown>) => (
                    <Item key={c.id as string} variant="outline" className="border-zinc-300 p-2.5 rounded-lg">
                      <ItemMedia className="size-9 rounded-lg border border-zinc-300 bg-zinc-50 text-black flex items-center justify-center shrink-0">
                        <Tag className="h-4 w-4 text-black" />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle className="text-xs font-normal text-black">{c.name as string}</ItemTitle>
                      </ItemContent>
                      <ItemActions className="flex items-center gap-2">
                        {(c.is_default as boolean) && (
                          <span className="px-2 py-0.5 rounded border border-zinc-300 bg-zinc-50 text-[11px] font-normal text-black">
                            default
                          </span>
                        )}
                        <ConfigActions
                          path="expenses/categories"
                          row={c}
                          label="expense category"
                          fields={['name']}
                          onChanged={() => void reloadConfig()}
                        />
                      </ItemActions>
                    </Item>
                  ))}
                </ItemGroup>
                {categories.length === 0 && (
                  <Empty className="py-6">
                    <EmptyHeader>
                      <EmptyMedia variant="icon"><Tag className="h-6 w-6 text-black" /></EmptyMedia>
                      <EmptyTitle className="text-xs font-normal text-black">No categories yet</EmptyTitle>
                      <EmptyDescription className="text-[11px] font-normal text-black">Add your first one above — expenses need somewhere to go.</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </CardContent>
            </Card>
          )}

          {tab === 'fx' && (
            <Card className="overflow-hidden rounded-xl border border-zinc-300 bg-white p-0 shadow-none">
              <div className="flex items-center gap-2 border-b border-zinc-200 px-5 py-3">
                <DollarSign className="h-4 w-4 text-black" />
                <CardTitle className="text-sm font-normal text-black">
                  FX Defaults
                </CardTitle>
              </div>
              <CardContent className="p-5">
                <p className="text-xs font-normal text-black mb-3">Configure default exchange rates for multi-currency transactions.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-normal text-black">Base Currency</label>
                    <Input value={settings?.fx_defaults ? Object.keys(settings.fx_defaults)[0] ?? 'INR' : 'INR'} disabled className="mt-1 border-zinc-300 text-xs font-normal text-black" />
                  </div>
                  <div>
                    <label className="text-xs font-normal text-black">USD to INR</label>
                    <Input type="number" step="0.0001" value={fxCurrencies['USD'] ?? '83.5'} onChange={(e) => setFxCurrencies(prev => ({ ...prev, USD: e.target.value }))} className="mt-1 border-zinc-300 text-xs font-normal text-black" />
                  </div>
                  <div>
                    <label className="text-xs font-normal text-black">EUR to INR</label>
                    <Input type="number" step="0.0001" value={fxCurrencies['EUR'] ?? '91.2'} onChange={(e) => setFxCurrencies(prev => ({ ...prev, EUR: e.target.value }))} className="mt-1 border-zinc-300 text-xs font-normal text-black" />
                  </div>
                  <div>
                    <label className="text-xs font-normal text-black">KES to INR</label>
                    <Input type="number" step="0.0001" value={fxCurrencies['KES'] ?? '0.65'} onChange={(e) => setFxCurrencies(prev => ({ ...prev, KES: e.target.value }))} className="mt-1 border-zinc-300 text-xs font-normal text-black" />
                  </div>
                </div>
                <Button onClick={() => {
                  const fxDefaults: Record<string, { currency: string; rate: number }> = {};
                  Object.entries(fxCurrencies).forEach(([currency, rate]) => {
                    fxDefaults[currency] = { currency, rate: parseFloat(rate) || 1 };
                  });
                  void saveSettings({ fx_defaults: fxDefaults });
                }} disabled={saving} className="mt-3 text-xs font-normal text-black bg-zinc-100 hover:bg-zinc-200 border border-zinc-300">
                  {saving ? (
                    <>
                      <Spinner className="mr-1.5 h-3.5 w-3.5" /> Saving…
                    </>
                  ) : (
                    'Save FX Rates'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {tab === 'evidence' && settings && (
            <Card className="overflow-hidden rounded-xl border border-zinc-300 bg-white p-0 shadow-none">
              <div className="flex items-center gap-2 border-b border-zinc-200 px-5 py-3">
                <Camera className="h-4 w-4 text-black" />
                <CardTitle className="text-sm font-normal text-black">
                  Evidence Policy
                </CardTitle>
              </div>
              <CardContent className="p-5">
                <p className="text-xs font-normal text-black mb-3">Configure when photo evidence is required for data entry.</p>
                <div className="space-y-2">
                  {settings.evidence_policy && Object.entries(settings.evidence_policy).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                      <label className="text-xs font-normal text-black capitalize">{key.replace(/_/g, ' ')}</label>
                      <select
                        className="border border-zinc-300 rounded text-xs font-normal text-black bg-white p-1.5 focus:border-black"
                        value={value}
                        onChange={(e) => {
                          const newPolicy = { ...settings.evidence_policy, [key]: e.target.value };
                          void saveSettings({ evidence_policy: newPolicy });
                        }}
                      >
                        <option value="off">Off</option>
                        <option value="optional">Optional</option>
                        <option value="required">Required</option>
                      </select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {tab === 'thresholds' && settings && (
            <>
            <Card className="overflow-hidden rounded-xl border border-zinc-300 bg-white p-0 shadow-none">
              <div className="flex items-center gap-2 border-b border-zinc-200 px-5 py-3">
                <Shield className="h-4 w-4 text-black" />
                <CardTitle className="text-sm font-normal text-black">
                  Thresholds & Working Hours
                </CardTitle>
              </div>
              <CardContent className="p-5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-normal text-black">Cut-off Time</label>
                    <Input type="time" value={settings.cut_off_time} onChange={(e) => { void saveSettings({ cut_off_time: e.target.value }); }} className="mt-1 border-zinc-300 text-xs font-normal text-black" />
                  </div>
                  <div>
                    <label className="text-xs font-normal text-black">Working Units per Day</label>
                    <Input type="number" value={settings.working_units_per_day} onChange={(e) => { void saveSettings({ working_units_per_day: parseInt(e.target.value) || 8 }); }} className="mt-1 border-zinc-300 text-xs font-normal text-black" />
                  </div>
                  <div>
                    <label className="text-xs font-normal text-black">Working Days per Month</label>
                    <Input type="number" value={settings.working_days_per_month} onChange={(e) => { void saveSettings({ working_days_per_month: parseInt(e.target.value) || 26 }); }} className="mt-1 border-zinc-300 text-xs font-normal text-black" />
                  </div>
                </div>
                <Button onClick={() => { void saveSettings(settings); }} disabled={saving} className="mt-3 text-xs font-normal text-black bg-zinc-100 hover:bg-zinc-200 border border-zinc-300">
                  {saving ? (
                    <>
                      <Spinner className="mr-1.5 h-3.5 w-3.5" /> Saving…
                    </>
                  ) : (
                    'Save Thresholds'
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-xl border border-zinc-300 bg-white p-0 shadow-none mt-5">
              <div className="flex items-center gap-2 border-b border-zinc-200 px-5 py-3">
                <Bell className="h-4 w-4 text-black" />
                <CardTitle className="text-sm font-normal text-black">
                  Alert Rules
                </CardTitle>
              </div>
              <CardContent className="p-5 space-y-4">
                <form onSubmit={(e) => void createRule(e)} className="grid gap-2.5 rounded-lg border border-zinc-300 bg-zinc-50 p-3.5 sm:grid-cols-4">
                  <div>
                    <label className="text-xs font-normal text-black">Rule *</label>
                    <NativeSelect
                      value={ruleForm.rule_type}
                      onChange={(e) => setRuleForm({ ...ruleForm, rule_type: e.target.value })}
                      className="mt-1 border-zinc-300 text-xs font-normal text-black"
                    >
                      {RULE_TYPES.map((t) => (
                        <NativeSelectOption key={t} value={t} disabled={alertRules.some((r) => r.rule_type === t)}>
                          {t.replace(/_/g, ' ')}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </div>
                  <div>
                    <label className="text-xs font-normal text-black">Threshold</label>
                    <Input
                      type="number"
                      step="any"
                      value={ruleForm.threshold}
                      onChange={(e) => setRuleForm({ ...ruleForm, threshold: e.target.value })}
                      placeholder="e.g. 7"
                      className="mt-1 border-zinc-300 text-xs font-normal text-black"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-normal text-black">Unit</label>
                    <Input
                      value={ruleForm.threshold_unit}
                      onChange={(e) => setRuleForm({ ...ruleForm, threshold_unit: e.target.value })}
                      placeholder="days, litres…"
                      className="mt-1 border-zinc-300 text-xs font-normal text-black"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" disabled={ruleBusy} className="text-xs font-normal text-black bg-zinc-100 hover:bg-zinc-200 border border-zinc-300">
                      {ruleBusy ? 'Adding…' : 'Add rule'}
                    </Button>
                  </div>
                </form>

                {configError && <p className="text-xs font-normal text-black">{configError}</p>}

                {alertRules.length === 0 ? (
                  <p className="text-xs font-normal text-black">No alert rules yet — add one above to start raising alerts.</p>
                ) : (
                  <div className="space-y-2">
                    {alertRules.map((r) => (
                      <div
                        key={String(r.id)}
                        className="flex flex-wrap items-center justify-between gap-2.5 rounded-lg border border-zinc-200 bg-zinc-50 p-3"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-normal text-black">{String(r.rule_type).replace(/_/g, ' ')}</p>
                          <p className="text-[11px] font-normal text-black">
                            {r.threshold === null || r.threshold === undefined
                              ? 'no threshold'
                              : `threshold ${String(r.threshold)}${r.threshold_unit ? ` ${String(r.threshold_unit)}` : ''}`}
                            {' · '}
                            {r.is_active ? 'active' : 'paused'}
                          </p>
                        </div>
                        <ConfigActions
                          path="alerts/rules"
                          row={r}
                          label="alert rule"
                          fields={['rule_type', 'threshold', 'threshold_unit', 'is_active']}
                          options={{
                            rule_type: RULE_TYPES.map((t) => ({ value: t, label: t.replace(/_/g, ' ') })),
                          }}
                          onChanged={() => void reloadConfig()}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            </>
          )}

          {tab === 'notifications' && (
            <Card className="overflow-hidden rounded-xl border border-zinc-300 bg-white p-0 shadow-none">
              <div className="flex items-center gap-2 border-b border-zinc-200 px-5 py-3">
                <Bell className="h-4 w-4 text-black" />
                <CardTitle className="text-sm font-normal text-black">
                  Notification Preferences
                </CardTitle>
              </div>
              <CardContent className="p-5">
                <p className="text-xs font-normal text-black mb-3">Configure how users receive notifications.</p>
                <div className="space-y-2">
                  {users.filter(u => u.is_active).map((u: Record<string, unknown>) => {
                    const prefs = (u.notification_preferences as Record<string, boolean>) ?? { whatsapp: true, sms: false, in_app: true };
                    return (
                      <div key={u.id as string} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg border border-zinc-300 bg-white flex items-center justify-center text-black">
                            <Users className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-normal text-black">{u.name as string || u.email as string}</p>
                            <p className="text-[11px] font-normal text-black">{u.role as string}</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          {(['whatsapp', 'sms', 'in_app'] as const).map((ch) => (
                            <label key={ch} className="flex items-center gap-1 text-xs font-normal text-black">
                              <input
                                type="checkbox"
                                checked={prefs[ch] ?? false}
                                onChange={(e) => {
                                  const newPrefs = { ...prefs, [ch]: e.target.checked };
                                  void authFetch(`/api/v1/users/${u.id}/notification-prefs`, {
                                    method: 'PUT',
                                    body: JSON.stringify({ notification_preferences: newPrefs }),
                                  });
                                }}
                                className="rounded border-zinc-300"
                              />
                              {ch === 'in_app' ? 'In App' : ch.charAt(0).toUpperCase() + ch.slice(1)}
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {tab === 'periodClose' && (
            <div className="space-y-5">
              <Card className="overflow-hidden rounded-xl border border-zinc-300 bg-white p-0 shadow-none">
                <div className="flex items-center gap-2 border-b border-zinc-200 px-5 py-3">
                  <Clock className="h-4 w-4 text-black" />
                  <CardTitle className="text-sm font-normal text-black">
                    Close Period
                  </CardTitle>
                </div>
                <CardContent className="p-5">
                  <p className="text-xs font-normal text-black mb-3">Lock a period to prevent further edits to work sessions and expenses.</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-normal text-black">Period</label>
                      <Input type="month" value={periodClosePeriod} onChange={(e) => setPeriodClosePeriod(e.target.value)} className="mt-1 border-zinc-300 text-xs font-normal text-black" />
                    </div>
                    <div>
                      <label className="text-xs font-normal text-black">Note</label>
                      <Input value={periodCloseNote} onChange={(e) => setPeriodCloseNote(e.target.value)} placeholder="Optional note" className="mt-1 border-zinc-300 text-xs font-normal text-black" />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={() => {
                        if (!periodClosePeriod) return;
                        if (!confirm('Close this period? This action cannot be undone.')) return;
                        void authFetch(`/api/v1/tenants/period-close/${periodClosePeriod}`, {
                          method: 'POST',
                          body: JSON.stringify({ note: periodCloseNote || undefined }),
                        }).then(() => {
                          setPeriodClosePeriod('');
                          setPeriodCloseNote('');
                        });
                      }} className="text-xs font-normal text-black bg-zinc-100 hover:bg-zinc-200 border border-zinc-300">
                        Close Period
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden rounded-xl border border-zinc-300 bg-white p-0 shadow-none">
                <div className="flex items-center gap-2 border-b border-zinc-200 px-5 py-3">
                  <CheckCircle className="h-4 w-4 text-black" />
                  <CardTitle className="text-sm font-normal text-black">
                    Closed Periods
                  </CardTitle>
                </div>
                <CardContent className="p-5">
                  <div className="space-y-2">
                    {periodCloses.map((pc) => (
                      <div key={pc.id as string} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                        <div>
                          <p className="text-xs font-normal text-black">{pc.period as string}</p>
                          {Boolean(pc.note) && <p className="text-[11px] font-normal text-black">{pc.note as string}</p>}
                        </div>
                        <span className="text-xs font-normal text-black">By {pc.closed_by_name as string || '—'}</span>
                      </div>
                    ))}
                    {periodCloses.length === 0 && (
                      <div className="text-center py-6">
                        <p className="text-xs font-normal text-black">No closed periods yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {tab === 'language' && (
            <Card className="overflow-hidden rounded-xl border border-zinc-300 bg-white p-0 shadow-none">
              <div className="flex items-center gap-2 border-b border-zinc-200 px-5 py-3">
                <Globe className="h-4 w-4 text-black" />
                <CardTitle className="text-sm font-normal text-black">
                  Language Settings
                </CardTitle>
              </div>
              <CardContent className="p-5">
                <div className="flex flex-wrap gap-2">
                  {([
                    ['en', 'English'],
                    ['fr', 'Français'],
                    ['hi', 'हिन्दी'],
                    ['bn', 'বাংলা'],
                    ['te', 'తెలుగు'],
                    ['mr', 'मराठी'],
                    ['ta', 'தமிழ்'],
                    ['gu', 'ગુજરાતી'],
                    ['kn', 'ಕನ್ನಡ'],
                    ['ml', 'മലയാളം'],
                    ['pa', 'ਪੰਜਾਬੀ'],
                    ['or', 'ଓଡ଼ିଆ'],
                    ['as', 'অসমীয়া'],
                    ['ur', 'اردو'],
                    ['ne', 'नेपाली'],
                  ] as [Locale, string][]).map(([l, label]) => {
                    const isSelected = locale === l;
                    return (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLocale(l)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-normal transition-colors border ${
                          isSelected 
                            ? 'bg-zinc-100 border-black text-black' 
                            : 'bg-white border-zinc-300 text-black hover:border-black'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs font-normal text-black bg-zinc-50 border border-zinc-200 p-2.5 rounded-lg">
                  Select your preferred language for the interface.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
