import { NextRequest, NextResponse } from 'next/server';
import {
  INITIAL_CLIENTS,
  INITIAL_SITES,
  INITIAL_OPERATORS,
  INITIAL_MACHINES,
  INITIAL_DEPLOYMENTS,
  INITIAL_RATE_CARDS,
  INITIAL_EXTRA_CHARGES,
  INITIAL_CONTRIBUTIONS,
  INITIAL_WORK_SESSIONS,
  INITIAL_ALERTS,
  INITIAL_ALERT_RULES,
  INITIAL_CASH_ACCOUNTS,
  INITIAL_CASH_TRANSFERS,
  INITIAL_CASH_EXPECTED,
  INITIAL_RECEIVABLES,
  INITIAL_UNUSED_ADVANCES,
  INITIAL_FUEL_LOGS,
  INITIAL_DOWNTIME,
  INITIAL_MAINTENANCE_TASKS,
  INITIAL_MAINTENANCE_VISITS,
  INITIAL_EXPENSES,
  INITIAL_EXPENSE_CATEGORIES_OBJ,
  INITIAL_USERS,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_SAVED_PROJECTIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CLIENT_MONEY_EVENTS,
  INITIAL_PERIOD_CLOSES,
  INITIAL_TENANT_SETTINGS,
  type Machine,
  type Client,
  type Site,
  type Operator,
  type Deployment,
  type RateCard,
  type ExtraCharge,
  type MachineContribution,
  type WorkSession,
  type Alert,
  type AlertRule,
  type CashAccount,
  type CashTransfer,
  type CashExpected,
  type Receivable,
  type UnusedAdvance,
  type FuelLog,
  type DowntimeSegment,
  type MaintenanceTask,
  type MaintenanceVisit,
  type Expense,
  type ExpenseCategory,
  type SupportTicket,
  type SavedProjection,
  type AuditEntry,
  type ClientMoneyEvent,
} from './dataset';

/**
 * Stateful in-memory database engine for Fleet OS.
 * Serves every route requested by owner and ops pages.
 */
class MockDatabase {
  machines: Machine[] = [...INITIAL_MACHINES];
  clients: Client[] = [...INITIAL_CLIENTS];
  sites: Site[] = [...INITIAL_SITES];
  operators: Operator[] = [...INITIAL_OPERATORS];
  deployments: Deployment[] = [...INITIAL_DEPLOYMENTS];
  rateCards: RateCard[] = [...INITIAL_RATE_CARDS];
  extraCharges: ExtraCharge[] = [...INITIAL_EXTRA_CHARGES];
  contributions: MachineContribution[] = [...INITIAL_CONTRIBUTIONS];
  workSessions: WorkSession[] = [...INITIAL_WORK_SESSIONS];
  alerts: Alert[] = [...INITIAL_ALERTS];
  alertRules: AlertRule[] = [...INITIAL_ALERT_RULES];
  cashAccounts: CashAccount[] = [...INITIAL_CASH_ACCOUNTS];
  cashTransfers: CashTransfer[] = [...INITIAL_CASH_TRANSFERS];
  cashExpected: CashExpected[] = [...INITIAL_CASH_EXPECTED];
  receivables: Receivable[] = [...INITIAL_RECEIVABLES];
  unusedAdvances: UnusedAdvance[] = [...INITIAL_UNUSED_ADVANCES];
  fuelLogs: FuelLog[] = [...INITIAL_FUEL_LOGS];
  downtimeSegments: DowntimeSegment[] = [...INITIAL_DOWNTIME];
  maintenanceTasks: MaintenanceTask[] = [...INITIAL_MAINTENANCE_TASKS];
  maintenanceVisits: MaintenanceVisit[] = [...INITIAL_MAINTENANCE_VISITS];
  expenses: Expense[] = [...INITIAL_EXPENSES];
  expenseCategories: ExpenseCategory[] = [...INITIAL_EXPENSE_CATEGORIES_OBJ];
  users: Array<{ id: string; name: string; email: string; role: string; is_active: boolean; created_at: string }> = [...INITIAL_USERS];
  supportTickets: SupportTicket[] = [...INITIAL_SUPPORT_TICKETS];
  savedProjections: SavedProjection[] = [...INITIAL_SAVED_PROJECTIONS];
  auditLogs: AuditEntry[] = [...INITIAL_AUDIT_LOGS];
  clientMoneyEvents: ClientMoneyEvent[] = [...INITIAL_CLIENT_MONEY_EVENTS];
  periodCloses = [...INITIAL_PERIOD_CLOSES];
  tenantSettings = { ...INITIAL_TENANT_SETTINGS };

  getKpis() {
    const totalMachines = this.machines.length;
    const workingMachines = this.machines.filter((m) => m.status_flag === 'active').length;
    const idleMachines = this.machines.filter((m) => m.status_flag === 'idle').length;
    const serviceMachines = this.machines.filter((m) => m.status_flag === 'service').length;
    const activeAlerts = this.alerts.filter((a) => !a.is_resolved).length;

    const totalRevenueMinor = this.contributions.reduce((acc, c) => acc + (c.billed_minor || 0), 0);
    const receivablesMinor = this.receivables.reduce((acc, r) => acc + (r.balance_minor || 0), 0);
    const advancesMinor = this.unusedAdvances.reduce((acc, a) => acc + (a.amount_minor || 0), 0);
    const totalCash = this.cashAccounts.reduce((acc, ca) => acc + (ca.balance || 0), 0);

    const totalHoursRun = this.workSessions.reduce((acc, s) => acc + (s.units_run || 0), 0);
    const totalDiesel = this.workSessions.reduce((acc, s) => acc + (s.diesel_litres || 0), 0);

    return {
      total_machines: totalMachines,
      working_machines: workingMachines,
      idle_machines: idleMachines,
      service_machines: serviceMachines,
      active_alerts: activeAlerts,
      utilization_pct: totalMachines > 0 ? Math.round((workingMachines / totalMachines) * 100) : 0,
      total_revenue_minor: totalRevenueMinor,
      total_receivables_minor: receivablesMinor,
      total_advances_minor: advancesMinor,
      cash_in_hand_minor: totalCash * 100,
      total_hours_today: Math.round(totalHoursRun * 10) / 10,
      total_diesel_litres: totalDiesel,
      currency: 'INR',
      period: 'today',
    };
  }

  getAIInsights() {
    return {
      summary: 'Fleet operating at high efficiency (84% active utilization). Excavator EX-01 requires hydraulic pressure inspection. Fuel efficiency across Bangalore Metro site is optimal at 20L/hr.',
      alerts: [
        'EX-01 hydraulic pressure drop detected during diaphragm walling',
        'DT-02 fuel level is below 15% reserve threshold at NH-44 site',
        'Invoice INV-2026-084 for L&T Construction is overdue by 18 days',
      ],
      recommendations: [
        'Shift idle Tipper DT-02 to Worli Coastal Road to absorb muck backlog',
        'Schedule preventive hydraulic filter flush for Excavator EX-01',
        'Issue automated reminder to L&T finance desk for pending ₹8.4L payment',
      ],
      utilization_trend: [
        { day: 'Mon', utilization: 82 },
        { day: 'Tue', utilization: 88 },
        { day: 'Wed', utilization: 85 },
        { day: 'Thu', utilization: 90 },
        { day: 'Fri', utilization: 84 },
        { day: 'Sat', utilization: 78 },
        { day: 'Sun', utilization: 72 },
      ],
    };
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __FLEETOS_MOCK_DB: MockDatabase | undefined;
}

export const mockDb = globalThis.__FLEETOS_MOCK_DB ?? new MockDatabase();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__FLEETOS_MOCK_DB = mockDb;
}

/**
 * Handle API requests locally against mock dataset when upstream backend is offline.
 */
export async function handleMockApiRequest(request: NextRequest, rawPath: string): Promise<NextResponse> {
  const method = request.method.toUpperCase();
  const cleanPath = rawPath.replace(/^\/v1\//, '').replace(/^\//, '');
  const [pathname, searchString] = cleanPath.split('?');
  const segments = pathname.split('/').filter(Boolean);
  const searchParams = new URLSearchParams(searchString || '');

  let body: Record<string, unknown> = {};
  if (method === 'POST' || method === 'PATCH' || method === 'PUT') {
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      body = {};
    }
  }

  // 1. HEALTH / STATUS
  if (segments[0] === 'health') {
    return NextResponse.json({ status: 'ok', mock: true, timestamp: new Date().toISOString() });
  }

  // 2. BILLING ROUTES
  if (segments[0] === 'billing') {
    if (segments[1] === 'kpis') {
      return NextResponse.json(mockDb.getKpis());
    }
    if (segments[1] === 'rate-cards') {
      if (method === 'GET') return NextResponse.json(mockDb.rateCards);
      if (method === 'POST') {
        const dep = mockDb.deployments.find((d) => d.id === body.deployment_id);
        const newCard: RateCard = {
          id: `rc-${Date.now().toString(36)}`,
          deployment_id: String(body.deployment_id || ''),
          machine_code: dep?.machine_code || 'MCH',
          site_name: dep?.site_name || 'Site',
          strategy: (body.strategy as 'hourly' | 'daily' | 'monthly') || 'hourly',
          rate_minor: Number(body.rate_minor || 250000),
          currency: String(body.currency || 'INR'),
          min_units_per_day: Number(body.min_units_per_day || 8),
          effective_from: String(body.effective_from || new Date().toISOString().slice(0, 10)),
          created_at: new Date().toISOString(),
        };
        mockDb.rateCards.unshift(newCard);
        return NextResponse.json(newCard, { status: 201 });
      }
    }
    if (segments[1] === 'extra-charges') {
      if (method === 'GET') return NextResponse.json(mockDb.extraCharges);
      if (method === 'POST') {
        const dep = mockDb.deployments.find((d) => d.id === body.deployment_id);
        const newExtra: ExtraCharge = {
          id: `ext-${Date.now().toString(36)}`,
          deployment_id: String(body.deployment_id || ''),
          machine_code: dep?.machine_code || 'MCH',
          site_name: dep?.site_name || 'Site',
          kind: String(body.kind || 'other'),
          date: String(body.date || new Date().toISOString().slice(0, 10)),
          amount_minor: Number(body.amount_minor || 0),
          currency: String(body.currency || 'INR'),
          note: String(body.note || ''),
          created_at: new Date().toISOString(),
        };
        mockDb.extraCharges.unshift(newExtra);
        return NextResponse.json(newExtra, { status: 201 });
      }
    }
    if (segments[1] === 'contribution') {
      return NextResponse.json(mockDb.contributions);
    }
    if (segments[1] === 'receivables') {
      return NextResponse.json(mockDb.receivables);
    }
    if (segments[1] === 'unused-advances') {
      return NextResponse.json(mockDb.unusedAdvances);
    }
    if (segments[1] === 'run') {
      return NextResponse.json({ success: true, message: 'Billing run completed successfully', invoices_generated: 1 });
    }
    if (segments[1] === 'ledger') {
      return NextResponse.json([
        { id: 'led-1', date: '2026-09-28', description: 'Metro Reach 6 Milestone Invoice #84', debit: 840000, credit: 0, balance: 840000 },
        { id: 'led-2', date: '2026-09-25', description: 'Advance received from Tata Projects', debit: 0, credit: 300000, balance: 540000 },
        { id: 'led-3', date: '2026-09-20', description: 'Afcons Coastal Road Package Billed', debit: 620000, credit: 0, balance: 1160000 },
      ]);
    }
  }

  // 3. MACHINES
  if (segments[0] === 'machines') {
    if (segments.length === 1) {
      if (method === 'GET') return NextResponse.json(mockDb.machines);
      if (method === 'POST') {
        const newMachine: Machine = {
          id: `mch-${Date.now().toString(36)}`,
          code: String(body.code || `MCH-${mockDb.machines.length + 1}`),
          type: String(body.type || 'excavator'),
          make: String(body.make || 'Generic'),
          model: String(body.model || 'Model'),
          year: Number(body.year || new Date().getFullYear()),
          chassis_no: String(body.chassis_no || `CHS-${Date.now()}`),
          primary_meter_type: (body.primary_meter_type as 'hours' | 'km') || 'hours',
          meter_unit_label: String(body.meter_unit_label || 'Hours'),
          current_meter: Number(body.current_meter || 0),
          status_flag: (body.status_flag as 'active' | 'service' | 'idle' | 'stopped' | 'transit') || 'active',
          hourly_rate: Number(body.hourly_rate || 2000),
          fuel_capacity_litres: Number(body.fuel_capacity_litres || 300),
          fuel_level_pct: Number(body.fuel_level_pct || 80),
          created_at: new Date().toISOString(),
        };
        mockDb.machines.unshift(newMachine);
        return NextResponse.json(newMachine, { status: 201 });
      }
    } else {
      const machineId = segments[1];
      const index = mockDb.machines.findIndex((m) => m.id === machineId || m.code === machineId);
      if (method === 'GET') {
        if (index === -1) return NextResponse.json({ detail: 'Machine not found' }, { status: 404 });
        return NextResponse.json(mockDb.machines[index]);
      }
      if (method === 'PATCH' || method === 'PUT') {
        if (index === -1) return NextResponse.json({ detail: 'Machine not found' }, { status: 404 });
        mockDb.machines[index] = { ...mockDb.machines[index], ...body } as Machine;
        return NextResponse.json(mockDb.machines[index]);
      }
      if (method === 'DELETE') {
        if (index !== -1) mockDb.machines.splice(index, 1);
        return NextResponse.json({ success: true });
      }
    }
  }

  // 4. CLIENTS
  if (segments[0] === 'clients') {
    if (segments.length === 1) {
      if (method === 'GET') return NextResponse.json(mockDb.clients);
      if (method === 'POST') {
        const newClient: Client = {
          id: `cli-${Date.now().toString(36)}`,
          name: String(body.name || 'New Client'),
          contact_person: String(body.contact_person || body.contact || ''),
          contact: String(body.contact_person || body.contact || ''),
          phone: String(body.phone || ''),
          whatsapp: String(body.whatsapp || body.phone || ''),
          email: String(body.email || ''),
          address: String(body.address || ''),
          currency: String(body.currency || 'INR'),
          payment_terms_days: Number(body.payment_terms_days || 30),
          total_projects: 1,
          total_revenue: 0,
          outstanding_balance: 0,
          status: 'active',
          created_at: new Date().toISOString(),
        };
        mockDb.clients.unshift(newClient);
        return NextResponse.json(newClient, { status: 201 });
      }
    } else {
      const clientId = segments[1];
      const index = mockDb.clients.findIndex((c) => c.id === clientId);
      if (method === 'GET') {
        if (index === -1) return NextResponse.json({ detail: 'Client not found' }, { status: 404 });
        return NextResponse.json(mockDb.clients[index]);
      }
      if (method === 'PATCH' || method === 'PUT') {
        if (index === -1) return NextResponse.json({ detail: 'Client not found' }, { status: 404 });
        mockDb.clients[index] = { ...mockDb.clients[index], ...body } as Client;
        return NextResponse.json(mockDb.clients[index]);
      }
      if (method === 'DELETE') {
        if (index !== -1) mockDb.clients.splice(index, 1);
        return NextResponse.json({ success: true });
      }
    }
  }

  // 5. SITES
  if (segments[0] === 'sites') {
    if (segments.length === 1) {
      if (method === 'GET') return NextResponse.json(mockDb.sites);
      if (method === 'POST') {
        const newSite: Site = {
          id: `site-${Date.now().toString(36)}`,
          client_id: String(body.client_id || (mockDb.clients[0]?.id ?? '')),
          client_name: mockDb.clients.find((c) => c.id === body.client_id)?.name || 'Default Client',
          name: String(body.name || 'New Site'),
          location: String(body.location || ''),
          address: String(body.address || ''),
          lat: Number(body.lat || 12.9716),
          lng: Number(body.lng || 77.5946),
          status: 'active',
          start_date: String(body.start_date || new Date().toISOString().slice(0, 10)),
          site_manager: String(body.site_manager || ''),
          manager_phone: String(body.manager_phone || ''),
          active_machines_count: 0,
          created_at: new Date().toISOString(),
        };
        mockDb.sites.unshift(newSite);
        return NextResponse.json(newSite, { status: 201 });
      }
    } else {
      const siteId = segments[1];
      const index = mockDb.sites.findIndex((s) => s.id === siteId);
      if (method === 'GET') {
        if (index === -1) return NextResponse.json({ detail: 'Site not found' }, { status: 404 });
        return NextResponse.json(mockDb.sites[index]);
      }
      if (method === 'PATCH' || method === 'PUT') {
        if (index === -1) return NextResponse.json({ detail: 'Site not found' }, { status: 404 });
        mockDb.sites[index] = { ...mockDb.sites[index], ...body } as Site;
        return NextResponse.json(mockDb.sites[index]);
      }
      if (method === 'DELETE') {
        if (index !== -1) mockDb.sites.splice(index, 1);
        return NextResponse.json({ success: true });
      }
    }
  }

  // 6. OPERATORS
  if (segments[0] === 'operators') {
    if (segments.length === 1) {
      if (method === 'GET') return NextResponse.json(mockDb.operators);
      if (method === 'POST') {
        const newOp: Operator = {
          id: `op-${Date.now().toString(36)}`,
          name: String(body.name || 'Operator'),
          phone: String(body.phone || ''),
          email: String(body.email || ''),
          license: String(body.license || body.license_number || `LIC-${Date.now().toString(36)}`),
          license_number: String(body.license_number || body.license || `LIC-${Date.now().toString(36)}`),
          experience_years: Number(body.experience_years || 5),
          specialization: String(body.specialization || 'Heavy Equipment'),
          hourly_wage: Number(body.hourly_wage || 300),
          rating: 4.8,
          is_active: true,
          status: 'available',
          created_at: new Date().toISOString(),
        };
        mockDb.operators.unshift(newOp);
        return NextResponse.json(newOp, { status: 201 });
      }
    } else {
      const opId = segments[1];
      const index = mockDb.operators.findIndex((o) => o.id === opId);
      if (method === 'GET') {
        if (index === -1) return NextResponse.json({ detail: 'Operator not found' }, { status: 404 });
        return NextResponse.json(mockDb.operators[index]);
      }
      if (method === 'PATCH' || method === 'PUT') {
        if (index === -1) return NextResponse.json({ detail: 'Operator not found' }, { status: 404 });
        mockDb.operators[index] = { ...mockDb.operators[index], ...body } as Operator;
        return NextResponse.json(mockDb.operators[index]);
      }
      if (method === 'DELETE') {
        if (index !== -1) mockDb.operators.splice(index, 1);
        return NextResponse.json({ success: true });
      }
    }
  }

  // 7. DEPLOYMENTS
  if (segments[0] === 'deployments') {
    if (segments.length === 1) {
      if (method === 'GET') return NextResponse.json(mockDb.deployments);
      if (method === 'POST') {
        const mch = mockDb.machines.find((m) => m.id === body.machine_id);
        const st = mockDb.sites.find((s) => s.id === body.site_id);
        const newDep: Deployment = {
          id: `dep-${Date.now().toString(36)}`,
          machine_id: String(body.machine_id || ''),
          machine_code: mch?.code,
          machine_type: mch?.type,
          site_id: String(body.site_id || ''),
          site_name: st?.name,
          client_id: String(body.client_id || st?.client_id || ''),
          client_name: st?.client_name,
          start_date: String(body.start_date || new Date().toISOString().slice(0, 10)),
          daily_rate: Number(body.daily_rate || 15000),
          status: 'active',
          machines: mch ? { code: mch.code } : undefined,
          sites: st ? { name: st.name } : undefined,
          created_at: new Date().toISOString(),
        };
        mockDb.deployments.unshift(newDep);
        return NextResponse.json(newDep, { status: 201 });
      }
    }
    if (segments[1] === 'machine' && segments[3] === 'active') {
      const machineId = segments[2];
      const activeDep = mockDb.deployments.find((d) => (d.machine_id === machineId || d.machine_code === machineId) && d.status === 'active');
      return NextResponse.json(activeDep || null);
    }
    if (segments.length === 3 && (segments[2] === 'release' || segments[2] === 'hold')) {
      const depId = segments[1];
      const dep = mockDb.deployments.find((d) => d.id === depId);
      if (dep) {
        dep.status = segments[2] === 'hold' ? 'on_hold_payment' : 'active';
      }
      return NextResponse.json(dep || { success: true });
    }
  }

  // 8. CASH MANAGEMENT
  if (segments[0] === 'cash') {
    if (segments[1] === 'accounts') {
      if (segments.length === 2) {
        if (method === 'GET') return NextResponse.json(mockDb.cashAccounts);
        if (method === 'POST') {
          const newAccount: CashAccount = {
            id: `cacc-${Date.now().toString(36)}`,
            name: String(body.name || 'New Cash Account'),
            type: (body.type as 'site_cash' | 'bank' | 'petty') || 'site_cash',
            balance: Number(body.balance || 0),
            currency: 'INR',
            created_at: new Date().toISOString(),
          };
          mockDb.cashAccounts.unshift(newAccount);
          return NextResponse.json(newAccount, { status: 201 });
        }
      }
      if (segments[3] === 'counts') {
        return NextResponse.json([
          { id: 'cnt-1', account_id: segments[2], expected_balance: 145000, counted_balance: 145000, difference: 0, counted_at: new Date().toISOString() },
        ]);
      }
    }
    if (segments[1] === 'transfers') {
      if (method === 'GET') return NextResponse.json(mockDb.cashTransfers);
      if (method === 'POST') {
        const fromAcc = mockDb.cashAccounts.find((a) => a.id === body.from_account_id);
        const toAcc = mockDb.cashAccounts.find((a) => a.id === body.to_account_id);
        const amt = Number(body.amount_minor || 0) / 100;
        if (fromAcc) fromAcc.balance = Math.max(0, fromAcc.balance - amt);
        if (toAcc) toAcc.balance += amt;
        const newXfer: CashTransfer = {
          id: `xfer-${Date.now().toString(36)}`,
          from_account_id: String(body.from_account_id || ''),
          from_account_name: fromAcc?.name || 'From Account',
          to_account_id: String(body.to_account_id || ''),
          to_account_name: toAcc?.name || 'To Account',
          amount_minor: Number(body.amount_minor || 0),
          currency: String(body.currency || 'INR'),
          reference: String(body.reference || 'REF-AUTO'),
          date: new Date().toISOString().slice(0, 10),
          created_at: new Date().toISOString(),
          status: 'completed',
        };
        mockDb.cashTransfers.unshift(newXfer);
        return NextResponse.json(newXfer, { status: 201 });
      }
    }
    if (segments[1] === 'expected') {
      return NextResponse.json(mockDb.cashExpected);
    }
    if (segments[1] === 'counts') {
      return NextResponse.json([
        { id: 'cnt-1', account_id: 'cacc-001', expected_balance: 145000, counted_balance: 145000, difference: 0, counted_at: new Date().toISOString() },
      ]);
    }
  }

  // 9. SUPPORT TICKETS
  if (segments[0] === 'support' && segments[1] === 'tickets') {
    if (method === 'GET') return NextResponse.json(mockDb.supportTickets);
    if (method === 'POST') {
      const newTicket: SupportTicket = {
        id: `tkt-${Date.now().toString(36)}`,
        ticket_number: `TCK-2026-0${mockDb.supportTickets.length + 50}`,
        subject: String(body.subject || 'Support Ticket'),
        description: String(body.description || ''),
        status: 'open',
        priority: 'medium',
        category: 'General Support',
        created_at: new Date().toISOString(),
      };
      mockDb.supportTickets.unshift(newTicket);
      return NextResponse.json(newTicket, { status: 201 });
    }
  }

  // 10. PROJECTIONS & REPORTS
  if (segments[0] === 'reports') {
    if (segments[1] === 'projection-inputs') {
      return NextResponse.json({
        working_days_per_month: 26,
        working_units_per_day: 8,
        expense_ratio: 38,
        currency: 'INR',
      });
    }
    if (segments[1] === 'saved-projections') {
      if (method === 'GET') return NextResponse.json(mockDb.savedProjections);
      if (method === 'POST') {
        const newProj: SavedProjection = {
          id: `proj-${Date.now().toString(36)}`,
          name: String(body.name || 'New Machine Projection'),
          machine_code: String(body.machine_code || 'EX-01'),
          working_days: Number(body.working_days || 26),
          units_per_day: Number(body.units_per_day || 8),
          rate_minor: Number(body.rate_minor || 250000),
          currency: String(body.currency || 'INR'),
          projected_billing_minor: Number(body.projected_billing_minor || 52000000),
          projected_costs_minor: Number(body.projected_costs_minor || 19760000),
          projected_contribution_minor: Number(body.projected_contribution_minor || 32240000),
          expense_ratio: Number(body.expense_ratio || 38),
          status: 'active',
        };
        mockDb.savedProjections.unshift(newProj);
        return NextResponse.json(newProj, { status: 201 });
      }
    }
    if (segments[1] === 'projections') {
      const days = Number(searchParams.get('working_days') || '26');
      const units = Number(searchParams.get('units_per_day') || '8');
      const rateMinor = Number(searchParams.get('rate_minor') || '260000');
      const currency = searchParams.get('currency') || 'INR';

      const totalUnits = days * units;
      const billingMinor = totalUnits * rateMinor;
      const expenseRatio = 38;
      const costsMinor = Math.round(billingMinor * (expenseRatio / 100));
      const contribMinor = billingMinor - costsMinor;

      return NextResponse.json({
        inputs: { workingDays: days, unitsPerDay: units, rateMinor, currency },
        expense_ratio: expenseRatio,
        projected_billing_minor: billingMinor,
        projected_costs_minor: costsMinor,
        projected_contribution_minor: contribMinor,
        currency,
        note: `Calculated at ${expenseRatio}% operating expense baseline (diesel, preventive servicing, operator allowance).`,
      });
    }
  }

  // 11. AUDIT ROUTE
  if (segments[0] === 'audit' || segments[0] === 'audit-log') {
    return NextResponse.json(mockDb.auditLogs);
  }

  // 12. USERS & SETTINGS
  if (segments[0] === 'users') {
    if (segments.length === 1) {
      if (method === 'GET') return NextResponse.json(mockDb.users);
    }
    if (segments[1] === 'invite' && method === 'POST') {
      const invited = {
        id: `usr-${Date.now().toString(36)}`,
        name: String(body.name || 'Invited User'),
        email: String(body.email || ''),
        role: String(body.role || 'ops'),
        is_active: true,
        created_at: new Date().toISOString(),
      };
      mockDb.users.push(invited);
      return NextResponse.json(invited, { status: 201 });
    }
  }

  if (segments[0] === 'tenants') {
    if (segments[1] === 'settings') {
      if (method === 'GET') return NextResponse.json(mockDb.tenantSettings);
      if (method === 'PUT' || method === 'PATCH') {
        Object.assign(mockDb.tenantSettings, body);
        return NextResponse.json(mockDb.tenantSettings);
      }
    }
    if (segments[1] === 'period-closes') {
      return NextResponse.json(mockDb.periodCloses);
    }
    if (segments[1] === 'period-close') {
      return NextResponse.json({ success: true, period: segments[2] });
    }
  }

  // 13. ALERTS & RULES
  if (segments[0] === 'alerts') {
    if (segments.length === 1 && method === 'GET') {
      return NextResponse.json(mockDb.alerts);
    }
    if (segments[1] === 'rules') {
      if (method === 'GET') return NextResponse.json(mockDb.alertRules);
      if (method === 'POST') {
        const newRule: AlertRule = {
          id: `rul-${Date.now().toString(36)}`,
          name: String(body.name || 'Alert Rule'),
          entity: String(body.entity || 'machines'),
          metric: String(body.metric || 'hours'),
          comparator: String(body.comparator || '>'),
          threshold: String(body.threshold || '10'),
          threshold_unit: String(body.threshold_unit || ''),
          severity: (body.severity as 'critical' | 'warning' | 'info') || 'warning',
          active: true,
        };
        mockDb.alertRules.unshift(newRule);
        return NextResponse.json(newRule, { status: 201 });
      }
    }
    if (segments.length === 2 && (method === 'PATCH' || method === 'PUT')) {
      const alert = mockDb.alerts.find((a) => a.id === segments[1]);
      if (alert) Object.assign(alert, body);
      return NextResponse.json(alert || { success: true });
    }
  }

  // 14. EXPENSES & CATEGORIES
  if (segments[0] === 'expenses') {
    if (segments[1] === 'categories') {
      if (method === 'GET') return NextResponse.json(mockDb.expenseCategories);
      if (method === 'POST') {
        const newCat: ExpenseCategory = {
          id: `cat-${Date.now().toString(36)}`,
          name: String(body.name || 'New Category'),
          description: String(body.description || ''),
        };
        mockDb.expenseCategories.push(newCat);
        return NextResponse.json(newCat, { status: 201 });
      }
    }
    if (segments.length === 1) {
      if (method === 'GET') return NextResponse.json(mockDb.expenses);
      if (method === 'POST') {
        const newExp: Expense = {
          id: `exp-${Date.now().toString(36)}`,
          category: String(body.category || 'Maintenance & Repairs'),
          category_name: String(body.category || 'Maintenance & Repairs'),
          amount: Number(body.amount || 0),
          amount_minor: Number(body.amount || 0) * 100,
          vendor: String(body.vendor || 'Local Vendor'),
          site_id: String(body.site_id || ''),
          machine_id: String(body.machine_id || ''),
          date: String(body.date || new Date().toISOString().slice(0, 10)),
          notes: String(body.notes || ''),
          created_by: 'demo-owner-001',
          created_at: new Date().toISOString(),
        };
        mockDb.expenses.unshift(newExp);
        return NextResponse.json(newExp, { status: 201 });
      }
    }
  }

  // 15. MAINTENANCE
  if (segments[0] === 'maintenance') {
    if (segments[1] === 'tasks') {
      if (method === 'GET') return NextResponse.json(mockDb.maintenanceTasks);
      if (method === 'POST') {
        const newTask: MaintenanceTask = {
          id: `tsk-${Date.now().toString(36)}`,
          title: String(body.title || 'Service Task'),
          interval_hours: Number(body.interval_hours || 500),
          category: String(body.category || 'Preventive'),
          description: String(body.description || ''),
        };
        mockDb.maintenanceTasks.push(newTask);
        return NextResponse.json(newTask, { status: 201 });
      }
    }
    if (segments[1] === 'visits') {
      return NextResponse.json(mockDb.maintenanceVisits);
    }
    if (segments[1] === 'machines') {
      const machineId = segments[2];
      if (segments[3] === 'status') {
        return NextResponse.json([
          { id: 'st-1', machine_id: machineId, status: 'good', next_service_due_hours: 4500, current_meter: 4280.5, last_service_date: '2026-09-15' },
        ]);
      }
      return NextResponse.json(mockDb.maintenanceVisits.filter((v) => v.machine_id === machineId));
    }
  }

  // 16. WORK SESSIONS & FUEL DOWNTIME
  if (segments[0] === 'work-sessions') {
    if (method === 'GET') {
      const machineId = searchParams.get('machine_id');
      if (machineId) {
        return NextResponse.json(mockDb.workSessions.filter((s) => s.machine_id === machineId));
      }
      return NextResponse.json(mockDb.workSessions);
    }
    if (method === 'POST') {
      const startMeter = Number(body.start_meter || 0);
      const endMeter = Number(body.end_meter || startMeter + 5);
      const unitsRun = Number(body.units_run || Math.max(0, endMeter - startMeter));
      const newSession: WorkSession = {
        id: `ses-${Date.now().toString(36)}`,
        machine_id: String(body.machine_id || mockDb.machines[0]?.id || ''),
        machine_code: mockDb.machines.find((m) => m.id === body.machine_id)?.code || 'EX-01',
        deployment_id: String(body.deployment_id || mockDb.deployments[0]?.id || ''),
        site_id: String(body.site_id || mockDb.sites[0]?.id || ''),
        site_name: mockDb.sites.find((s) => s.id === body.site_id)?.name || 'Bangalore Metro',
        operator_id: String(body.operator_id || mockDb.operators[0]?.id || ''),
        operator_name: mockDb.operators.find((o) => o.id === body.operator_id)?.name || 'Ramesh Kumar',
        start_at: String(body.start_at || new Date().toISOString()),
        end_at: String(body.end_at || new Date().toISOString()),
        start_meter: startMeter,
        end_meter: endMeter,
        units_run: unitsRun,
        idle_hours: Number(body.idle_hours || 0.5),
        diesel_litres: Number(body.diesel_litres || 80),
        activity: String(body.activity || 'Site excavation work'),
        billable: body.billable !== false,
        notes: String(body.notes || ''),
        revenue: unitsRun * 2500,
        created_by: 'demo-owner-001',
        created_at: new Date().toISOString(),
        is_current: true,
      };
      mockDb.workSessions.unshift(newSession);
      return NextResponse.json(newSession, { status: 201 });
    }
  }

  if (segments[0] === 'fuel-downtime') {
    if (segments[1] === 'fuel-logs') {
      const machineId = searchParams.get('machine_id');
      if (machineId) {
        return NextResponse.json(mockDb.fuelLogs.filter((f) => f.machine_id === machineId));
      }
      return NextResponse.json(mockDb.fuelLogs);
    }
    if (segments[1] === 'downtime') {
      const machineId = searchParams.get('machine_id');
      if (machineId) {
        return NextResponse.json(mockDb.downtimeSegments.filter((d) => d.machine_id === machineId));
      }
      return NextResponse.json(mockDb.downtimeSegments);
    }
  }

  // 17. CLIENT MONEY EVENTS (Receipts, Advances)
  if (segments[0] === 'client-money' && segments[1] === 'events') {
    if (method === 'GET') return NextResponse.json(mockDb.clientMoneyEvents);
    if (method === 'POST') {
      const cli = mockDb.clients.find((c) => c.id === body.client_id);
      const newEvent: ClientMoneyEvent = {
        id: `cme-${Date.now().toString(36)}`,
        client_id: String(body.client_id || ''),
        client_name: cli?.name || 'Client',
        event_type: (body.event_type as 'receipt' | 'advance' | 'refund' | 'credit_note') || 'receipt',
        amount_minor: Number(body.amount_minor || 0),
        currency: String(body.currency || 'INR'),
        mode: String(body.mode || 'cash'),
        reference: String(body.reference || 'REF-AUTO'),
        event_date: String(body.event_date || new Date().toISOString().slice(0, 10)),
        created_by: 'demo-owner-001',
        created_at: new Date().toISOString(),
      };
      mockDb.clientMoneyEvents.unshift(newEvent);
      return NextResponse.json(newEvent, { status: 201 });
    }
  }

  // 18. AI INSIGHTS
  if (segments[0] === 'insights') {
    return NextResponse.json(mockDb.getAIInsights());
  }

  // Default fallback
  return NextResponse.json([]);
}
