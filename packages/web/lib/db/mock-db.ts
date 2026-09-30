import { NextRequest, NextResponse } from 'next/server';
import {
  INITIAL_CLIENTS,
  INITIAL_SITES,
  INITIAL_OPERATORS,
  INITIAL_MACHINES,
  INITIAL_DEPLOYMENTS,
  INITIAL_WORK_SESSIONS,
  INITIAL_ALERTS,
  INITIAL_CASH_ACCOUNTS,
  INITIAL_RECEIVABLES,
  INITIAL_UNUSED_ADVANCES,
  INITIAL_FUEL_LOGS,
  INITIAL_DOWNTIME,
  INITIAL_MAINTENANCE_TASKS,
  INITIAL_MAINTENANCE_VISITS,
  INITIAL_EXPENSES,
  INITIAL_EXPENSE_CATEGORIES,
  INITIAL_USERS,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_AUDIT_LOGS,
  type Machine,
  type Client,
  type Site,
  type Operator,
  type Deployment,
  type WorkSession,
  type Alert,
  type CashAccount,
  type Receivable,
  type UnusedAdvance,
  type FuelLog,
  type DowntimeSegment,
  type MaintenanceTask,
  type MaintenanceVisit,
  type Expense,
} from './dataset';

/**
 * State container for mock in-memory database.
 * Preserves data updates (creations, edits, deletions) during runtime.
 */
class MockDatabase {
  machines: Machine[] = [...INITIAL_MACHINES];
  clients: Client[] = [...INITIAL_CLIENTS];
  sites: Site[] = [...INITIAL_SITES];
  operators: Operator[] = [...INITIAL_OPERATORS];
  deployments: Deployment[] = [...INITIAL_DEPLOYMENTS];
  workSessions: WorkSession[] = [...INITIAL_WORK_SESSIONS];
  alerts: Alert[] = [...INITIAL_ALERTS];
  cashAccounts: CashAccount[] = [...INITIAL_CASH_ACCOUNTS];
  receivables: Receivable[] = [...INITIAL_RECEIVABLES];
  unusedAdvances: UnusedAdvance[] = [...INITIAL_UNUSED_ADVANCES];
  fuelLogs: FuelLog[] = [...INITIAL_FUEL_LOGS];
  downtimeSegments: DowntimeSegment[] = [...INITIAL_DOWNTIME];
  maintenanceTasks: MaintenanceTask[] = [...INITIAL_MAINTENANCE_TASKS];
  maintenanceVisits: MaintenanceVisit[] = [...INITIAL_MAINTENANCE_VISITS];
  expenses: Expense[] = [...INITIAL_EXPENSES];
  expenseCategories: string[] = [...INITIAL_EXPENSE_CATEGORIES];
  users: Array<{ id: string; name: string; email: string; role: string; is_active: boolean }> = [...INITIAL_USERS];
  supportTickets = [...INITIAL_SUPPORT_TICKETS];
  auditLogs = [...INITIAL_AUDIT_LOGS];

  getKpis() {
    const totalMachines = this.machines.length;
    const workingMachines = this.machines.filter((m) => m.status_flag === 'active').length;
    const idleMachines = this.machines.filter((m) => m.status_flag === 'idle').length;
    const serviceMachines = this.machines.filter((m) => m.status_flag === 'service').length;
    const activeAlerts = this.alerts.filter((a) => !a.is_resolved).length;

    const totalRevenueMinor = this.clients.reduce((acc, c) => acc + (c.total_revenue || 0), 0);
    const receivablesMinor = this.receivables.reduce((acc, r) => acc + (r.amount_minor || 0), 0);
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

// Global singleton to persist state in Node.js server memory during development
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
  const segments = cleanPath.split('/').filter(Boolean);

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

  // 2. BILLING KPIS & SUMMARY
  if (segments[0] === 'billing') {
    if (segments[1] === 'kpis') {
      return NextResponse.json(mockDb.getKpis());
    }
    if (segments[1] === 'receivables') {
      return NextResponse.json(mockDb.receivables);
    }
    if (segments[1] === 'unused-advances') {
      return NextResponse.json(mockDb.unusedAdvances);
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
      if (method === 'GET') {
        return NextResponse.json(mockDb.machines);
      }
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
      if (method === 'GET') {
        return NextResponse.json(mockDb.clients);
      }
      if (method === 'POST') {
        const newClient: Client = {
          id: `cli-${Date.now().toString(36)}`,
          name: String(body.name || 'New Client'),
          contact_person: String(body.contact_person || ''),
          phone: String(body.phone || ''),
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
      if (method === 'GET') {
        return NextResponse.json(mockDb.sites);
      }
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
      if (method === 'GET') {
        return NextResponse.json(mockDb.operators);
      }
      if (method === 'POST') {
        const newOp: Operator = {
          id: `op-${Date.now().toString(36)}`,
          name: String(body.name || 'Operator'),
          phone: String(body.phone || ''),
          email: String(body.email || ''),
          license_number: String(body.license_number || `LIC-${Date.now().toString(36)}`),
          experience_years: Number(body.experience_years || 5),
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
    if (method === 'GET') return NextResponse.json(mockDb.deployments);
    if (method === 'POST') {
      const newDep: Deployment = {
        id: `dep-${Date.now().toString(36)}`,
        machine_id: String(body.machine_id || ''),
        site_id: String(body.site_id || ''),
        client_id: String(body.client_id || ''),
        start_date: String(body.start_date || new Date().toISOString().slice(0, 10)),
        daily_rate: Number(body.daily_rate || 15000),
        status: 'active',
        created_at: new Date().toISOString(),
      };
      mockDb.deployments.unshift(newDep);
      return NextResponse.json(newDep, { status: 201 });
    }
  }

  // 8. WORK SESSIONS
  if (segments[0] === 'work-sessions') {
    if (method === 'GET') return NextResponse.json(mockDb.workSessions);
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
        created_at: new Date().toISOString(),
        is_current: true,
      };
      mockDb.workSessions.unshift(newSession);
      return NextResponse.json(newSession, { status: 201 });
    }
  }

  // 9. ALERTS
  if (segments[0] === 'alerts') {
    if (segments.length === 1 && method === 'GET') {
      return NextResponse.json(mockDb.alerts);
    }
    if (segments.length === 2 && (method === 'PATCH' || method === 'PUT')) {
      const alertId = segments[1];
      const alert = mockDb.alerts.find((a) => a.id === alertId);
      if (alert) Object.assign(alert, body);
      return NextResponse.json(alert || { success: true });
    }
    if (segments[1] === 'rules') {
      return NextResponse.json([
        { id: 'rule-1', name: 'Low Fuel Warning', threshold: '15%', severity: 'warning', active: true },
        { id: 'rule-2', name: 'Hydraulic Pressure Fluctuation', threshold: '20% drop', severity: 'critical', active: true },
        { id: 'rule-3', name: 'Excessive Idle Engine Time', threshold: '> 2.0 hours', severity: 'warning', active: true },
      ]);
    }
  }

  // 10. CASH ACCOUNTS & MANAGEMENT
  if (segments[0] === 'cash' || segments[0] === 'cash-accounts') {
    if (segments[1] === 'accounts' || segments[0] === 'cash-accounts' || segments.length === 1) {
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
    if (segments[1] === 'counts') {
      return NextResponse.json([
        { id: 'cnt-1', account_id: 'cacc-001', expected_balance: 145000, counted_balance: 145000, difference: 0, counted_at: new Date().toISOString() },
      ]);
    }
    if (segments[1] === 'transfers') {
      return NextResponse.json([
        { id: 'xfer-1', from_account: 'HDFC Corporate Operating A/c', to_account: 'Site Cash — Metro Block A', amount: 50000, date: '2026-09-28', status: 'completed' },
      ]);
    }
  }

  if (segments[0] === 'cash-counts') {
    return NextResponse.json([
      { id: 'cnt-1', account_id: 'cacc-001', expected_balance: 145000, counted_balance: 145000, difference: 0, counted_at: new Date().toISOString() },
    ]);
  }

  if (segments[0] === 'cash-transfers') {
    return NextResponse.json([
      { id: 'xfer-1', from_account: 'HDFC Corporate Operating A/c', to_account: 'Site Cash — Metro Block A', amount: 50000, date: '2026-09-28', status: 'completed' },
    ]);
  }

  // 11. FUEL LOGS
  if (segments[0] === 'fuel-logs' || segments[0] === 'fuel') {
    if (method === 'GET') return NextResponse.json(mockDb.fuelLogs);
    if (method === 'POST') {
      const newLog: FuelLog = {
        id: `fuel-${Date.now().toString(36)}`,
        machine_id: String(body.machine_id || mockDb.machines[0]?.id || ''),
        machine_code: mockDb.machines.find((m) => m.id === body.machine_id)?.code || 'EX-01',
        site_id: String(body.site_id || mockDb.sites[0]?.id || ''),
        litres: Number(body.litres || 100),
        rate_per_litre: Number(body.rate_per_litre || 89.5),
        total_cost: Number(body.litres || 100) * Number(body.rate_per_litre || 89.5),
        meter_reading: Number(body.meter_reading || 4000),
        bunk_name: String(body.bunk_name || 'Indian Oil Commercial Bunk'),
        fuelled_at: new Date().toISOString(),
      };
      mockDb.fuelLogs.unshift(newLog);
      return NextResponse.json(newLog, { status: 201 });
    }
  }

  // 12. DOWNTIME
  if (segments[0] === 'downtime-segments' || segments[0] === 'downtime') {
    if (method === 'GET') return NextResponse.json(mockDb.downtimeSegments);
    if (method === 'POST') {
      const newDowntime: DowntimeSegment = {
        id: `dt-${Date.now().toString(36)}`,
        machine_id: String(body.machine_id || ''),
        machine_code: mockDb.machines.find((m) => m.id === body.machine_id)?.code || 'MCH-01',
        site_id: String(body.site_id || ''),
        reason: (body.reason as 'breakdown' | 'no_diesel' | 'weather' | 'transport' | 'service') || 'breakdown',
        notes: String(body.notes || ''),
        duration_hours: Number(body.duration_hours || 1),
        started_at: String(body.started_at || new Date().toISOString()),
      };
      mockDb.downtimeSegments.unshift(newDowntime);
      return NextResponse.json(newDowntime, { status: 201 });
    }
  }

  // 13. MAINTENANCE
  if (segments[0] === 'maintenance') {
    if (segments[1] === 'tasks') {
      return NextResponse.json(mockDb.maintenanceTasks);
    }
    if (segments[1] === 'visits') {
      return NextResponse.json(mockDb.maintenanceVisits);
    }
    if (segments[1] === 'machines') {
      return NextResponse.json(mockDb.maintenanceVisits.filter((v) => v.machine_id === segments[2]));
    }
  }

  // 14. EXPENSES
  if (segments[0] === 'expenses') {
    if (segments[1] === 'categories') {
      return NextResponse.json(mockDb.expenseCategories);
    }
    if (method === 'GET') return NextResponse.json(mockDb.expenses);
    if (method === 'POST') {
      const newExp: Expense = {
        id: `exp-${Date.now().toString(36)}`,
        category: String(body.category || 'Maintenance & Repairs'),
        amount: Number(body.amount || 0),
        vendor: String(body.vendor || 'Local Vendor'),
        site_id: String(body.site_id || ''),
        machine_id: String(body.machine_id || ''),
        date: String(body.date || new Date().toISOString().slice(0, 10)),
        notes: String(body.notes || ''),
      };
      mockDb.expenses.unshift(newExp);
      return NextResponse.json(newExp, { status: 201 });
    }
  }

  // 15. USERS & SETTINGS
  if (segments[0] === 'users') {
    if (method === 'GET') return NextResponse.json(mockDb.users);
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
      return NextResponse.json({
        company_name: 'Fleet OS Infrastructure Logistics',
        currency: 'INR',
        fiscal_year_start: '04-01',
        auto_alerts_enabled: true,
        timezone: 'Asia/Kolkata',
      });
    }
    if (segments[1] === 'period-closes') {
      return NextResponse.json([
        { period: '2026-08', closed_at: '2026-09-02T18:00:00Z', closed_by: 'owner@fleetech.io' },
      ]);
    }
  }

  // 16. SUPPORT TICKETS
  if (segments[0] === 'support') {
    if (segments[1] === 'tickets') {
      if (method === 'GET') return NextResponse.json(mockDb.supportTickets);
      if (method === 'POST') {
        const newTicket = {
          id: `tkt-${Date.now().toString(36)}`,
          ticket_number: `TCK-2026-0${mockDb.supportTickets.length + 45}`,
          subject: String(body.subject || 'Support Ticket'),
          status: 'open',
          priority: String(body.priority || 'medium'),
          category: String(body.category || 'General Support'),
          created_at: new Date().toISOString(),
          messages: [{ sender: 'user', text: String(body.message || ''), at: new Date().toISOString() }],
        };
        mockDb.supportTickets.unshift(newTicket);
        return NextResponse.json(newTicket, { status: 201 });
      }
    }
  }

  // 17. AUDIT LOGS
  if (segments[0] === 'audit' || segments[0] === 'audit-log') {
    return NextResponse.json(mockDb.auditLogs);
  }

  // 18. AI INSIGHTS
  if (segments[0] === 'insights') {
    return NextResponse.json(mockDb.getAIInsights());
  }

  // Default fallback for any unhandled GET list
  return NextResponse.json([]);
}
