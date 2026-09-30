/**
 * Comprehensive Fleet OS Master Domain Dataset
 * Populates all data required across all cards, widgets, and pages:
 * - Billing (Deployments, Rate cards, Extra charges, Contributions, Receivables, Aging)
 * - Support (Tickets, Chat, Resolution metrics)
 * - Settings (Users, Machines, Period closes, Expense categories, Alert rules, Tenant settings)
 * - Projections (Inputs, Calculations, Saved projections)
 * - Cash (Accounts, Remittances/Transfers, Expected balances, Denomination counts)
 * - Audit (Versioned log entries with operations, tables, and actor emails)
 * - Operations (Sessions, Fuel logs, Downtime, Maintenance, Receipts)
 */

export interface Machine {
  id: string;
  code: string;
  type: string;
  make: string;
  model: string;
  year: number;
  chassis_no: string;
  primary_meter_type: 'hours' | 'km';
  meter_unit_label: string;
  current_meter: number;
  status_flag: 'active' | 'service' | 'idle' | 'stopped' | 'transit';
  flag_note?: string;
  hourly_rate?: number;
  site_id?: string;
  site_name?: string;
  client_id?: string;
  client_name?: string;
  operator_id?: string;
  operator_name?: string;
  fuel_capacity_litres?: number;
  fuel_level_pct?: number;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  contact_person: string;
  contact?: string;
  phone: string;
  whatsapp?: string;
  email: string;
  address: string;
  currency: string;
  payment_terms_days: number;
  total_projects: number;
  total_revenue: number;
  outstanding_balance: number;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Site {
  id: string;
  client_id: string;
  client_name?: string;
  name: string;
  location: string;
  address: string;
  lat: number;
  lng: number;
  status: 'active' | 'completed' | 'on_hold';
  start_date: string;
  end_date?: string;
  site_manager?: string;
  manager_phone?: string;
  active_machines_count?: number;
  created_at: string;
}

export interface Operator {
  id: string;
  name: string;
  phone: string;
  email?: string;
  license?: string;
  license_number: string;
  experience_years: number;
  specialization?: string;
  hourly_wage: number;
  rating: number;
  assigned_machine_id?: string;
  assigned_machine_code?: string;
  is_active: boolean;
  status: 'on_shift' | 'available' | 'on_leave';
  created_at: string;
}

export interface Deployment {
  id: string;
  machine_id: string;
  machine_code?: string;
  machine_type?: string;
  site_id: string;
  site_name?: string;
  client_id: string;
  client_name?: string;
  operator_id?: string;
  start_date: string;
  end_date?: string;
  daily_rate: number;
  status: 'active' | 'on_hold_payment' | 'ended';
  created_at: string;
  machines?: { code: string };
  sites?: { name: string };
}

export interface RateCard {
  id: string;
  deployment_id: string;
  machine_code?: string;
  site_name?: string;
  strategy: 'hourly' | 'daily' | 'monthly';
  rate_minor: number;
  currency: string;
  min_units_per_day: number;
  effective_from: string;
  created_at: string;
}

export interface ExtraCharge {
  id: string;
  deployment_id: string;
  machine_code?: string;
  site_name?: string;
  kind: string;
  date: string;
  amount_minor: number;
  currency: string;
  note?: string;
  created_at: string;
}

export interface MachineContribution {
  machine_id: string;
  machine_code: string;
  billed_minor: number;
  diesel_minor: number;
  parts_minor: number;
  labour_minor: number;
  contribution_minor: number;
}

export interface Receivable {
  id: string;
  invoice_number: string;
  client_id: string;
  client_name: string;
  amount_minor: number;
  billed_minor: number;
  receipts_minor: number;
  advances_minor: number;
  balance_minor: number;
  issued_at: string;
  due_at: string;
  status: 'pending' | 'overdue' | 'paid';
  site_name?: string;
  ledger?: Array<{
    id: string;
    kind: string;
    amount_minor: number;
    due_date?: string;
    date?: string;
    description?: string;
  }>;
}

export interface UnusedAdvance {
  id: string;
  client_id: string;
  client_name: string;
  amount_minor: number;
  received_at: string;
  reference: string;
}

export interface CashAccount {
  id: string;
  name: string;
  type: 'site_cash' | 'bank' | 'petty';
  balance: number;
  currency: string;
  account_number?: string;
  site_id?: string;
  created_at: string;
}

export interface CashTransfer {
  id: string;
  from_account_id: string;
  from_account_name?: string;
  to_account_id: string;
  to_account_name?: string;
  amount_minor: number;
  currency: string;
  reference?: string;
  date: string;
  created_at: string;
  status: 'completed' | 'pending';
}

export interface CashExpected {
  id: string;
  account_id: string;
  account_name: string;
  expected_minor: number;
  last_count_minor: number;
  difference_minor: number;
  status: 'balanced' | 'discrepancy';
  updated_at: string;
}

export interface WorkSession {
  id: string;
  machine_id: string;
  machine_code?: string;
  deployment_id: string;
  site_id: string;
  site_name?: string;
  operator_id: string;
  operator_name?: string;
  start_at: string;
  end_at?: string;
  start_meter: number;
  end_meter: number;
  units_run: number;
  idle_hours: number;
  diesel_litres: number;
  activity: string;
  billable: boolean;
  notes?: string;
  revenue: number;
  created_by?: string;
  created_at: string;
  is_current: boolean;
}

export interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  entity_type: 'machine' | 'client' | 'billing' | 'operator' | 'site';
  entity_id?: string;
  entity_name?: string;
  is_resolved: boolean;
  created_at: string;
}

export interface AlertRule {
  id: string;
  name: string;
  entity: string;
  metric: string;
  comparator: string;
  threshold: string;
  threshold_unit: string;
  severity: 'critical' | 'warning' | 'info';
  active: boolean;
}

export interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  category: string;
  created_at: string;
}

export interface SavedProjection {
  id: string;
  name: string;
  machine_code: string;
  working_days: number;
  units_per_day: number;
  rate_minor: number;
  currency: string;
  projected_billing_minor: number;
  projected_costs_minor: number;
  projected_contribution_minor: number;
  expense_ratio: number;
  status: string;
}

export interface AuditEntry {
  id: string;
  table_name: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  record_id: string;
  user_email: string;
  data: Record<string, unknown>;
  created_at: string;
}

export interface FuelLog {
  id: string;
  machine_id: string;
  machine_code: string;
  site_id: string;
  litres: number;
  rate_per_litre: number;
  total_cost: number;
  meter_reading: number;
  bunk_name: string;
  created_by?: string;
  fuelled_at: string;
  created_at: string;
}

export interface DowntimeSegment {
  id: string;
  machine_id: string;
  machine_code: string;
  site_id: string;
  reason: 'breakdown' | 'no_diesel' | 'weather' | 'transport' | 'service';
  reason_code?: string;
  notes: string;
  duration_hours: number;
  started_at: string;
  ended_at?: string;
  created_by?: string;
  created_at: string;
}

export interface MaintenanceTask {
  id: string;
  title: string;
  interval_hours: number;
  category: string;
  description: string;
}

export interface MaintenanceVisit {
  id: string;
  machine_id: string;
  machine_code: string;
  visit_date: string;
  performed_by: string;
  meter_at_service: number;
  tasks_completed: string[];
  parts_cost: number;
  labour_cost: number;
  notes: string;
  created_by?: string;
  created_at: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
}

export interface Expense {
  id: string;
  category: string;
  category_name?: string;
  amount: number;
  amount_minor?: number;
  vendor: string;
  site_id?: string;
  machine_id?: string;
  date: string;
  notes: string;
  created_by?: string;
  created_at: string;
}

export interface ClientMoneyEvent {
  id: string;
  client_id: string;
  client_name?: string;
  event_type: 'receipt' | 'advance' | 'refund' | 'credit_note';
  amount_minor: number;
  currency: string;
  mode: string;
  reference: string;
  event_date: string;
  created_by?: string;
  created_at: string;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * INITIAL STATIC DATASET
 * ───────────────────────────────────────────────────────────────────────────── */

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-001',
    name: 'L&T Construction',
    contact_person: 'Mr. Arvind Swamy',
    contact: 'Mr. Arvind Swamy',
    phone: '+91 98450 12345',
    whatsapp: '+91 98450 12345',
    email: 'arvind.swamy@intecc.com',
    address: 'L&T Manapakkam Campus, Mount Poonamallee Rd, Chennai',
    currency: 'INR',
    payment_terms_days: 30,
    total_projects: 3,
    total_revenue: 685000000,
    outstanding_balance: 84000000,
    status: 'active',
    created_at: '2025-01-15T09:00:00Z',
  },
  {
    id: 'cli-002',
    name: 'Afcons Infrastructure Ltd',
    contact_person: 'Mr. Rajeshwar Rao',
    contact: 'Mr. Rajeshwar Rao',
    phone: '+91 99201 67890',
    whatsapp: '+91 99201 67890',
    email: 'r.rao@afcons.com',
    address: 'Afcons House, 16 Veera Desai Road, Andheri West, Mumbai',
    currency: 'INR',
    payment_terms_days: 45,
    total_projects: 2,
    total_revenue: 420000000,
    outstanding_balance: 62000000,
    status: 'active',
    created_at: '2025-02-10T10:30:00Z',
  },
  {
    id: 'cli-003',
    name: 'Tata Projects Ltd',
    contact_person: 'Ms. Sunita Deshmukh',
    contact: 'Ms. Sunita Deshmukh',
    phone: '+91 98230 45678',
    whatsapp: '+91 98230 45678',
    email: 'sdeshmukh@tataprojects.com',
    address: 'One Boulevard, Lake Boulevard Rd, Hiranandani Business Park, Powai',
    currency: 'INR',
    payment_terms_days: 30,
    total_projects: 2,
    total_revenue: 345000000,
    outstanding_balance: 45000000,
    status: 'active',
    created_at: '2025-03-01T08:15:00Z',
  },
  {
    id: 'cli-004',
    name: 'Shapoorji Pallonji & Co',
    contact_person: 'Mr. Farokh Mehta',
    contact: 'Mr. Farokh Mehta',
    phone: '+91 98190 87654',
    whatsapp: '+91 98190 87654',
    email: 'farokh.mehta@shapoorji.com',
    address: 'SP Centre, 41/44 Minoo Desai Marg, Colaba, Mumbai',
    currency: 'INR',
    payment_terms_days: 60,
    total_projects: 1,
    total_revenue: 195000000,
    outstanding_balance: 38000000,
    status: 'active',
    created_at: '2025-04-12T11:00:00Z',
  },
  {
    id: 'cli-005',
    name: 'Dilip Buildcon Ltd',
    contact_person: 'Mr. Devendra Suryavanshi',
    contact: 'Mr. Devendra Suryavanshi',
    phone: '+91 97555 11223',
    whatsapp: '+91 97555 11223',
    email: 'devendra.s@dilipbuildcon.co.in',
    address: 'Plot No. 5, Inside Govind Narayan Singh Gate, Chuna Bhatti, Bhopal',
    currency: 'INR',
    payment_terms_days: 30,
    total_projects: 2,
    total_revenue: 280000000,
    outstanding_balance: 51000000,
    status: 'active',
    created_at: '2025-05-18T14:20:00Z',
  },
  {
    id: 'cli-006',
    name: 'NCC Urban Infrastructure',
    contact_person: 'Mr. K. V. Ramana',
    contact: 'Mr. K. V. Ramana',
    phone: '+91 98490 33445',
    whatsapp: '+91 98490 33445',
    email: 'ramana.kv@nccurban.com',
    address: 'NCC House, Madhapur, Hyderabad, Telangana',
    currency: 'INR',
    payment_terms_days: 45,
    total_projects: 1,
    total_revenue: 145000000,
    outstanding_balance: 29000000,
    status: 'active',
    created_at: '2025-06-22T09:45:00Z',
  },
];

export const INITIAL_SITES: Site[] = [
  {
    id: 'site-001',
    client_id: 'cli-001',
    client_name: 'L&T Construction',
    name: 'Bangalore Metro Phase 2 — Reach 6',
    location: 'Dairy Circle to Nagawara Underground, Bengaluru',
    address: 'Bannerghatta Main Rd, Adugodi, Bengaluru, Karnataka 560030',
    lat: 12.9345,
    lng: 77.6012,
    status: 'active',
    start_date: '2025-01-20',
    end_date: '2027-12-31',
    site_manager: 'Sanjay Deshpande',
    manager_phone: '+91 98451 98765',
    active_machines_count: 4,
    created_at: '2025-01-20T08:00:00Z',
  },
  {
    id: 'site-002',
    client_id: 'cli-002',
    client_name: 'Afcons Infrastructure Ltd',
    name: 'Coastal Roadway — Marine Drive to Worli',
    location: 'Package II, Worli Sea Face, Mumbai',
    address: 'Khan Abdul Gaffar Khan Rd, Worli, Mumbai, Maharashtra 400030',
    lat: 19.0144,
    lng: 72.8179,
    status: 'active',
    start_date: '2025-02-15',
    end_date: '2027-06-30',
    site_manager: 'Pradeep Kulkarni',
    manager_phone: '+91 99202 54321',
    active_machines_count: 3,
    created_at: '2025-02-15T09:00:00Z',
  },
  {
    id: 'site-003',
    client_id: 'cli-003',
    client_name: 'Tata Projects Ltd',
    name: 'Kempegowda Airport Terminal 2 Expansion',
    location: 'North Airfield Runway Extension, Devanahalli',
    address: 'KIAL Road, Devanahalli, Bengaluru, Karnataka 560300',
    lat: 13.1986,
    lng: 77.7066,
    status: 'active',
    start_date: '2025-03-10',
    end_date: '2026-11-30',
    site_manager: 'Mahesh Nair',
    manager_phone: '+91 98860 11223',
    active_machines_count: 2,
    created_at: '2025-03-10T10:00:00Z',
  },
  {
    id: 'site-004',
    client_id: 'cli-004',
    client_name: 'Shapoorji Pallonji & Co',
    name: 'Prestige Tech Cloud — Phase 4 Foundation',
    location: 'Marathahalli-Sarjapur Outer Ring Road, Bengaluru',
    address: 'Kadubeesanahalli, Varthur Hobli, Bengaluru 560103',
    lat: 12.9372,
    lng: 77.6974,
    status: 'active',
    start_date: '2025-04-15',
    end_date: '2026-08-31',
    site_manager: 'Kiran Gowda',
    manager_phone: '+91 97411 88990',
    active_machines_count: 1,
    created_at: '2025-04-15T11:00:00Z',
  },
  {
    id: 'site-005',
    client_id: 'cli-005',
    client_name: 'Dilip Buildcon Ltd',
    name: 'NH-44 Highway Six-Laning Package 1',
    location: 'Hosur to Krishnagiri Expressway Corridor',
    address: 'NH-44 Toll Plaza, Krishnagiri, Tamil Nadu 635001',
    lat: 12.5186,
    lng: 78.2138,
    status: 'active',
    start_date: '2025-05-20',
    end_date: '2027-04-30',
    site_manager: 'Rajendra Singh',
    manager_phone: '+91 94250 67890',
    active_machines_count: 2,
    created_at: '2025-05-20T08:30:00Z',
  },
];

export const INITIAL_OPERATORS: Operator[] = [
  {
    id: 'op-001',
    name: 'Ramesh Kumar',
    phone: '+91 98451 11223',
    email: 'ramesh.k@fleetteam.in',
    license: 'KA-05-2016-HE-00841',
    license_number: 'KA-05-2016-HE-00841',
    experience_years: 9,
    specialization: 'Excavator & Deep Trenching',
    hourly_wage: 350,
    rating: 4.9,
    assigned_machine_id: 'mch-001',
    assigned_machine_code: 'EX-01',
    is_active: true,
    status: 'on_shift',
    created_at: '2024-11-01T08:00:00Z',
  },
  {
    id: 'op-002',
    name: 'Suresh Yadav',
    phone: '+91 98210 22334',
    email: 'suresh.y@fleetteam.in',
    license: 'MH-03-2018-HE-00192',
    license_number: 'MH-03-2018-HE-00192',
    experience_years: 7,
    specialization: 'Hydraulic Breaker Attachment',
    hourly_wage: 320,
    rating: 4.8,
    assigned_machine_id: 'mch-002',
    assigned_machine_code: 'EX-02',
    is_active: true,
    status: 'on_shift',
    created_at: '2024-11-01T08:00:00Z',
  },
  {
    id: 'op-003',
    name: 'Abdul Karim',
    phone: '+91 97420 33445',
    email: 'abdul.k@fleetteam.in',
    license: 'KA-01-2015-HE-00912',
    license_number: 'KA-01-2015-HE-00912',
    experience_years: 11,
    specialization: 'Crawler Dozers & Leveling',
    hourly_wage: 380,
    rating: 5.0,
    assigned_machine_id: 'mch-003',
    assigned_machine_code: 'DZ-01',
    is_active: true,
    status: 'on_shift',
    created_at: '2024-11-01T08:00:00Z',
  },
  {
    id: 'op-004',
    name: 'Vikram Singh',
    phone: '+91 99110 44556',
    email: 'vikram.s@fleetteam.in',
    license: 'DL-04-2019-HE-00311',
    license_number: 'DL-04-2019-HE-00311',
    experience_years: 6,
    specialization: 'Backhoe & Utility Lines',
    hourly_wage: 300,
    rating: 4.7,
    assigned_machine_id: 'mch-004',
    assigned_machine_code: 'BL-01',
    is_active: true,
    status: 'on_shift',
    created_at: '2024-11-01T08:00:00Z',
  },
  {
    id: 'op-005',
    name: 'Pradeep Sharma',
    phone: '+91 98260 55667',
    email: 'pradeep.s@fleetteam.in',
    license: 'MP-09-2017-HE-00420',
    license_number: 'MP-09-2017-HE-00420',
    experience_years: 8,
    specialization: 'Wheel Loader & Batching Hopper',
    hourly_wage: 330,
    rating: 4.8,
    assigned_machine_id: 'mch-005',
    assigned_machine_code: 'WL-01',
    is_active: true,
    status: 'on_shift',
    created_at: '2024-11-01T08:00:00Z',
  },
  {
    id: 'op-006',
    name: 'Manoj Gowda',
    phone: '+91 99450 66778',
    email: 'manoj.g@fleetteam.in',
    license: 'KA-51-2020-HMV-00124',
    license_number: 'KA-51-2020-HMV-00124',
    experience_years: 5,
    specialization: 'Heavy Tipper Haulage',
    hourly_wage: 280,
    rating: 4.6,
    assigned_machine_id: 'mch-006',
    assigned_machine_code: 'DT-01',
    is_active: true,
    status: 'on_shift',
    created_at: '2024-12-01T08:00:00Z',
  },
];

export const INITIAL_MACHINES: Machine[] = [
  {
    id: 'mch-001',
    code: 'EX-01',
    type: 'excavator',
    make: 'Caterpillar',
    model: '320D3 Hydraulic Excavator',
    year: 2023,
    chassis_no: 'CAT0320DPNTR98214',
    primary_meter_type: 'hours',
    meter_unit_label: 'Hours',
    current_meter: 4280.5,
    status_flag: 'active',
    flag_note: 'Operating on Metro pier foundation excavation',
    hourly_rate: 2600,
    site_id: 'site-001',
    site_name: 'Bangalore Metro Phase 2 — Reach 6',
    client_id: 'cli-001',
    client_name: 'L&T Construction',
    operator_id: 'op-001',
    operator_name: 'Ramesh Kumar',
    fuel_capacity_litres: 400,
    fuel_level_pct: 68,
    created_at: '2024-10-10T08:00:00Z',
  },
  {
    id: 'mch-002',
    code: 'EX-02',
    type: 'excavator',
    make: 'Komatsu',
    model: 'PC210-10M0 Heavy Duty',
    year: 2023,
    chassis_no: 'KOMPC210K718290',
    primary_meter_type: 'hours',
    meter_unit_label: 'Hours',
    current_meter: 3950.0,
    status_flag: 'active',
    flag_note: 'Trenching and rock handling',
    hourly_rate: 2500,
    site_id: 'site-001',
    site_name: 'Bangalore Metro Phase 2 — Reach 6',
    client_id: 'cli-001',
    client_name: 'L&T Construction',
    operator_id: 'op-002',
    operator_name: 'Suresh Yadav',
    fuel_capacity_litres: 380,
    fuel_level_pct: 75,
    created_at: '2024-10-15T09:00:00Z',
  },
  {
    id: 'mch-003',
    code: 'DZ-01',
    type: 'dozer',
    make: 'Caterpillar',
    model: 'D6R Heavy Crawler Dozer',
    year: 2022,
    chassis_no: 'CAT00D6RB918231',
    primary_meter_type: 'hours',
    meter_unit_label: 'Hours',
    current_meter: 5620.2,
    status_flag: 'active',
    flag_note: 'Bulk earthmoving and leveling',
    hourly_rate: 3400,
    site_id: 'site-002',
    site_name: 'Coastal Roadway — Marine Drive to Worli',
    client_id: 'cli-002',
    client_name: 'Afcons Infrastructure Ltd',
    operator_id: 'op-003',
    operator_name: 'Abdul Karim',
    fuel_capacity_litres: 450,
    fuel_level_pct: 82,
    created_at: '2024-09-20T10:00:00Z',
  },
  {
    id: 'mch-004',
    code: 'BL-01',
    type: 'backhoe_loader',
    make: 'JCB',
    model: '3DX Super EcoXcellence',
    year: 2024,
    chassis_no: 'JCB3DXSE2024881',
    primary_meter_type: 'hours',
    meter_unit_label: 'Hours',
    current_meter: 1840.4,
    status_flag: 'active',
    flag_note: 'General utility and pipe trenching',
    hourly_rate: 1400,
    site_id: 'site-003',
    site_name: 'Kempegowda Airport Terminal 2 Expansion',
    client_id: 'cli-003',
    client_name: 'Tata Projects Ltd',
    operator_id: 'op-004',
    operator_name: 'Vikram Singh',
    fuel_capacity_litres: 128,
    fuel_level_pct: 60,
    created_at: '2024-12-05T11:00:00Z',
  },
  {
    id: 'mch-005',
    code: 'WL-01',
    type: 'wheel_loader',
    make: 'Volvo',
    model: 'L120H High Lift Wheel Loader',
    year: 2023,
    chassis_no: 'VCE0L120HX91823',
    primary_meter_type: 'hours',
    meter_unit_label: 'Hours',
    current_meter: 3210.8,
    status_flag: 'active',
    flag_note: 'Sub-base aggregate hopper feeding',
    hourly_rate: 2900,
    site_id: 'site-002',
    site_name: 'Coastal Roadway — Marine Drive to Worli',
    client_id: 'cli-002',
    client_name: 'Afcons Infrastructure Ltd',
    operator_id: 'op-005',
    operator_name: 'Pradeep Sharma',
    fuel_capacity_litres: 310,
    fuel_level_pct: 88,
    created_at: '2024-10-25T08:30:00Z',
  },
  {
    id: 'mch-006',
    code: 'DT-01',
    type: 'dump_truck',
    make: 'Tata Motors',
    model: 'Prima 2830.K Heavy Tipper 16 Cu.M',
    year: 2023,
    chassis_no: 'MAT428030P9K1827',
    primary_meter_type: 'km',
    meter_unit_label: 'Km',
    current_meter: 48920,
    status_flag: 'active',
    flag_note: 'Muck disposal to designated dump yard',
    hourly_rate: 1750,
    site_id: 'site-001',
    site_name: 'Bangalore Metro Phase 2 — Reach 6',
    client_id: 'cli-001',
    client_name: 'L&T Construction',
    operator_id: 'op-006',
    operator_name: 'Manoj Gowda',
    fuel_capacity_litres: 300,
    fuel_level_pct: 54,
    created_at: '2024-11-12T09:15:00Z',
  },
  {
    id: 'mch-007',
    code: 'DT-02',
    type: 'dump_truck',
    make: 'BharatBenz',
    model: '2828C Heavy Duty Tipper 16 Cu.M',
    year: 2023,
    chassis_no: 'ME32828CPNK82914',
    primary_meter_type: 'km',
    meter_unit_label: 'Km',
    current_meter: 52180,
    status_flag: 'idle',
    flag_note: 'Waiting for shovel turnaround at crusher bunk',
    hourly_rate: 1750,
    site_id: 'site-005',
    site_name: 'NH-44 Highway Six-Laning Package 1',
    client_id: 'cli-005',
    client_name: 'Dilip Buildcon Ltd',
    fuel_capacity_litres: 280,
    fuel_level_pct: 12,
    created_at: '2024-11-12T09:15:00Z',
  },
  {
    id: 'mch-008',
    code: 'MG-01',
    type: 'motor_grader',
    make: 'Caterpillar',
    model: '140K Motor Grader with Ripper',
    year: 2022,
    chassis_no: 'CAT0140KPNT82190',
    primary_meter_type: 'hours',
    meter_unit_label: 'Hours',
    current_meter: 3740.0,
    status_flag: 'active',
    flag_note: 'Fine subgrade grading on highway chainage 42-48',
    hourly_rate: 3100,
    site_id: 'site-005',
    site_name: 'NH-44 Highway Six-Laning Package 1',
    client_id: 'cli-005',
    client_name: 'Dilip Buildcon Ltd',
    fuel_capacity_litres: 340,
    fuel_level_pct: 70,
    created_at: '2024-09-18T10:00:00Z',
  },
  {
    id: 'mch-009',
    code: 'CR-01',
    type: 'crane',
    make: 'Sany',
    model: 'STC500 50T Telescopic Mobile Crane',
    year: 2023,
    chassis_no: 'SNYSTC500202391',
    primary_meter_type: 'hours',
    meter_unit_label: 'Hours',
    current_meter: 2150.6,
    status_flag: 'active',
    flag_note: 'Pre-cast U-girder erection at pier cap P-14',
    hourly_rate: 4500,
    site_id: 'site-001',
    site_name: 'Bangalore Metro Phase 2 — Reach 6',
    client_id: 'cli-001',
    client_name: 'L&T Construction',
    fuel_capacity_litres: 350,
    fuel_level_pct: 91,
    created_at: '2024-10-30T11:00:00Z',
  },
];

export const INITIAL_DEPLOYMENTS: Deployment[] = [
  {
    id: 'dep-001',
    machine_id: 'mch-001',
    machine_code: 'EX-01',
    machine_type: 'excavator',
    site_id: 'site-001',
    site_name: 'Bangalore Metro Phase 2 — Reach 6',
    client_id: 'cli-001',
    client_name: 'L&T Construction',
    operator_id: 'op-001',
    start_date: '2025-01-20',
    daily_rate: 20800,
    status: 'active',
    machines: { code: 'EX-01' },
    sites: { name: 'Bangalore Metro Phase 2 — Reach 6' },
    created_at: '2025-01-20T08:00:00Z',
  },
  {
    id: 'dep-002',
    machine_id: 'mch-002',
    machine_code: 'EX-02',
    machine_type: 'excavator',
    site_id: 'site-001',
    site_name: 'Bangalore Metro Phase 2 — Reach 6',
    client_id: 'cli-001',
    client_name: 'L&T Construction',
    operator_id: 'op-002',
    start_date: '2025-01-20',
    daily_rate: 20000,
    status: 'active',
    machines: { code: 'EX-02' },
    sites: { name: 'Bangalore Metro Phase 2 — Reach 6' },
    created_at: '2025-01-20T08:00:00Z',
  },
  {
    id: 'dep-003',
    machine_id: 'mch-003',
    machine_code: 'DZ-01',
    machine_type: 'dozer',
    site_id: 'site-002',
    site_name: 'Coastal Roadway — Marine Drive to Worli',
    client_id: 'cli-002',
    client_name: 'Afcons Infrastructure Ltd',
    operator_id: 'op-003',
    start_date: '2025-02-15',
    daily_rate: 27200,
    status: 'active',
    machines: { code: 'DZ-01' },
    sites: { name: 'Coastal Roadway — Marine Drive to Worli' },
    created_at: '2025-02-15T09:00:00Z',
  },
  {
    id: 'dep-004',
    machine_id: 'mch-004',
    machine_code: 'BL-01',
    machine_type: 'backhoe_loader',
    site_id: 'site-003',
    site_name: 'Kempegowda Airport Terminal 2 Expansion',
    client_id: 'cli-003',
    client_name: 'Tata Projects Ltd',
    operator_id: 'op-004',
    start_date: '2025-03-10',
    daily_rate: 11200,
    status: 'active',
    machines: { code: 'BL-01' },
    sites: { name: 'Kempegowda Airport Terminal 2 Expansion' },
    created_at: '2025-03-10T10:00:00Z',
  },
  {
    id: 'dep-005',
    machine_id: 'mch-005',
    machine_code: 'WL-01',
    machine_type: 'wheel_loader',
    site_id: 'site-002',
    site_name: 'Coastal Roadway — Marine Drive to Worli',
    client_id: 'cli-002',
    client_name: 'Afcons Infrastructure Ltd',
    operator_id: 'op-005',
    start_date: '2025-02-15',
    daily_rate: 23200,
    status: 'active',
    machines: { code: 'WL-01' },
    sites: { name: 'Coastal Roadway — Marine Drive to Worli' },
    created_at: '2025-02-15T09:00:00Z',
  },
  {
    id: 'dep-006',
    machine_id: 'mch-006',
    machine_code: 'DT-01',
    machine_type: 'dump_truck',
    site_id: 'site-001',
    site_name: 'Bangalore Metro Phase 2 — Reach 6',
    client_id: 'cli-001',
    client_name: 'L&T Construction',
    operator_id: 'op-006',
    start_date: '2025-01-20',
    daily_rate: 14000,
    status: 'active',
    machines: { code: 'DT-01' },
    sites: { name: 'Bangalore Metro Phase 2 — Reach 6' },
    created_at: '2025-01-20T08:00:00Z',
  },
  {
    id: 'dep-007',
    machine_id: 'mch-007',
    machine_code: 'DT-02',
    machine_type: 'dump_truck',
    site_id: 'site-005',
    site_name: 'NH-44 Highway Six-Laning Package 1',
    client_id: 'cli-005',
    client_name: 'Dilip Buildcon Ltd',
    start_date: '2025-05-20',
    daily_rate: 14000,
    status: 'on_hold_payment',
    machines: { code: 'DT-02' },
    sites: { name: 'NH-44 Highway Six-Laning Package 1' },
    created_at: '2025-05-20T08:30:00Z',
  },
];

export const INITIAL_RATE_CARDS: RateCard[] = [
  { id: 'rc-001', deployment_id: 'dep-001', machine_code: 'EX-01', site_name: 'Bangalore Metro', strategy: 'hourly', rate_minor: 260000, currency: 'INR', min_units_per_day: 8, effective_from: '2025-01-20', created_at: '2025-01-20T08:00:00Z' },
  { id: 'rc-002', deployment_id: 'dep-002', machine_code: 'EX-02', site_name: 'Bangalore Metro', strategy: 'hourly', rate_minor: 250000, currency: 'INR', min_units_per_day: 8, effective_from: '2025-01-20', created_at: '2025-01-20T08:00:00Z' },
  { id: 'rc-003', deployment_id: 'dep-003', machine_code: 'DZ-01', site_name: 'Coastal Roadway', strategy: 'hourly', rate_minor: 340000, currency: 'INR', min_units_per_day: 8, effective_from: '2025-02-15', created_at: '2025-02-15T09:00:00Z' },
  { id: 'rc-004', deployment_id: 'dep-004', machine_code: 'BL-01', site_name: 'Airport T2', strategy: 'hourly', rate_minor: 140000, currency: 'INR', min_units_per_day: 8, effective_from: '2025-03-10', created_at: '2025-03-10T10:00:00Z' },
  { id: 'rc-005', deployment_id: 'dep-005', machine_code: 'WL-01', site_name: 'Coastal Roadway', strategy: 'hourly', rate_minor: 290000, currency: 'INR', min_units_per_day: 8, effective_from: '2025-02-15', created_at: '2025-02-15T09:00:00Z' },
  { id: 'rc-006', deployment_id: 'dep-006', machine_code: 'DT-01', site_name: 'Bangalore Metro', strategy: 'hourly', rate_minor: 175000, currency: 'INR', min_units_per_day: 8, effective_from: '2025-01-20', created_at: '2025-01-20T08:00:00Z' },
];

export const INITIAL_EXTRA_CHARGES: ExtraCharge[] = [
  { id: 'ext-001', deployment_id: 'dep-001', machine_code: 'EX-01', site_name: 'Bangalore Metro', kind: 'mobilisation', date: '2026-09-20', amount_minor: 3500000, currency: 'INR', note: 'Heavy trailer mobilisation from central yard to Metro Pier 14', created_at: '2026-09-20T10:00:00Z' },
  { id: 'ext-002', deployment_id: 'dep-002', machine_code: 'EX-02', site_name: 'Bangalore Metro', kind: 'attachment', date: '2026-09-22', amount_minor: 2500000, currency: 'INR', note: 'Hydraulic rock breaker chisel replacement fee', created_at: '2026-09-22T11:00:00Z' },
  { id: 'ext-003', deployment_id: 'dep-003', machine_code: 'DZ-01', site_name: 'Coastal Roadway', kind: 'overtime', date: '2026-09-25', amount_minor: 1850000, currency: 'INR', note: 'Night tidal reclamation crew emergency overtime', created_at: '2026-09-25T12:00:00Z' },
];

export const INITIAL_CONTRIBUTIONS: MachineContribution[] = [
  { machine_id: 'mch-001', machine_code: 'EX-01', billed_minor: 384000000, diesel_minor: 82000000, parts_minor: 18500000, labour_minor: 24000000, contribution_minor: 259500000 },
  { machine_id: 'mch-002', machine_code: 'EX-02', billed_minor: 345000000, diesel_minor: 76000000, parts_minor: 14000000, labour_minor: 22000000, contribution_minor: 233000000 },
  { machine_id: 'mch-003', machine_code: 'DZ-01', billed_minor: 452000000, diesel_minor: 114000000, parts_minor: 26000000, labour_minor: 26000000, contribution_minor: 286000000 },
  { machine_id: 'mch-004', machine_code: 'BL-01', billed_minor: 185000000, diesel_minor: 39000000, parts_minor: 8500000, labour_minor: 18000000, contribution_minor: 119500000 },
  { machine_id: 'mch-005', machine_code: 'WL-01', billed_minor: 320000000, diesel_minor: 71000000, parts_minor: 19500000, labour_minor: 21000000, contribution_minor: 208500000 },
  { machine_id: 'mch-006', machine_code: 'DT-01', billed_minor: 215000000, diesel_minor: 68000000, parts_minor: 12000000, labour_minor: 17000000, contribution_minor: 118000000 },
];

export const INITIAL_RECEIVABLES: Receivable[] = [
  {
    id: 'rec-001',
    invoice_number: 'INV-2026-084',
    client_id: 'cli-001',
    client_name: 'L&T Construction',
    amount_minor: 84000000,
    billed_minor: 685000000,
    receipts_minor: 601000000,
    advances_minor: 45000000,
    balance_minor: 84000000,
    issued_at: '2026-08-10',
    due_at: '2026-09-10',
    status: 'overdue',
    site_name: 'Bangalore Metro Phase 2 — Reach 6',
    ledger: [
      { id: 'ent-1', kind: 'invoice', amount_minor: 84000000, due_date: '2026-09-10', description: 'Metro Diaphragm wall excavation invoice #84' },
      { id: 'ent-2', kind: 'receipt', amount_minor: 45000000, date: '2026-09-01', description: 'RTGS advance payment from L&T finance' },
    ],
  },
  {
    id: 'rec-002',
    invoice_number: 'INV-2026-088',
    client_id: 'cli-002',
    client_name: 'Afcons Infrastructure Ltd',
    amount_minor: 62000000,
    billed_minor: 420000000,
    receipts_minor: 358000000,
    advances_minor: 20000000,
    balance_minor: 62000000,
    issued_at: '2026-08-25',
    due_at: '2026-10-10',
    status: 'pending',
    site_name: 'Coastal Roadway — Marine Drive to Worli',
    ledger: [
      { id: 'ent-3', kind: 'invoice', amount_minor: 62000000, due_date: '2026-10-10', description: 'Worli sea face reclamation billing #88' },
    ],
  },
  {
    id: 'rec-003',
    invoice_number: 'INV-2026-089',
    client_id: 'cli-003',
    client_name: 'Tata Projects Ltd',
    amount_minor: 45000000,
    billed_minor: 345000000,
    receipts_minor: 300000000,
    advances_minor: 30000000,
    balance_minor: 45000000,
    issued_at: '2026-09-01',
    due_at: '2026-10-01',
    status: 'pending',
    site_name: 'Kempegowda Airport Terminal 2 Expansion',
    ledger: [
      { id: 'ent-4', kind: 'invoice', amount_minor: 45000000, due_date: '2026-10-01', description: 'North Runway utility corridor billing #89' },
    ],
  },
  {
    id: 'rec-004',
    invoice_number: 'INV-2026-090',
    client_id: 'cli-005',
    client_name: 'Dilip Buildcon Ltd',
    amount_minor: 51000000,
    billed_minor: 280000000,
    receipts_minor: 229000000,
    advances_minor: 0,
    balance_minor: 51000000,
    issued_at: '2026-09-05',
    due_at: '2026-10-05',
    status: 'pending',
    site_name: 'NH-44 Highway Six-Laning Package 1',
    ledger: [
      { id: 'ent-5', kind: 'invoice', amount_minor: 51000000, due_date: '2026-10-05', description: 'Highway chainage 40-50 subgrade billing' },
    ],
  },
];

export const INITIAL_UNUSED_ADVANCES: UnusedAdvance[] = [
  { id: 'adv-001', client_id: 'cli-001', client_name: 'L&T Construction', amount_minor: 45000000, received_at: '2026-09-01', reference: 'RTGS-HDFC-9918231' },
  { id: 'adv-002', client_id: 'cli-003', client_name: 'Tata Projects Ltd', amount_minor: 30000000, received_at: '2026-09-12', reference: 'NEFT-ICIC-8827182' },
  { id: 'adv-003', client_id: 'cli-006', client_name: 'NCC Urban Infrastructure', amount_minor: 20000000, received_at: '2026-09-18', reference: 'IMPS-SBI-7726190' },
];

export const INITIAL_CASH_ACCOUNTS: CashAccount[] = [
  { id: 'cacc-001', name: 'Site Cash — Metro Block A', type: 'site_cash', balance: 145000, currency: 'INR', site_id: 'site-001', created_at: '2025-01-20T08:00:00Z' },
  { id: 'cacc-002', name: 'HDFC Corporate Operating A/c', type: 'bank', balance: 4820000, currency: 'INR', account_number: '50200049281744', created_at: '2024-10-01T08:00:00Z' },
  { id: 'cacc-003', name: 'SBI Capex & Fleet Treasury', type: 'bank', balance: 2250000, currency: 'INR', account_number: '39281048192', created_at: '2024-10-01T08:00:00Z' },
  { id: 'cacc-004', name: 'Petty Cash — HQ Workshop', type: 'petty', balance: 42500, currency: 'INR', created_at: '2025-01-01T08:00:00Z' },
];

export const INITIAL_CASH_TRANSFERS: CashTransfer[] = [
  { id: 'xfer-001', from_account_id: 'cacc-002', from_account_name: 'HDFC Corporate Operating A/c', to_account_id: 'cacc-001', to_account_name: 'Site Cash — Metro Block A', amount_minor: 5000000, currency: 'INR', reference: 'CHQ-981244', date: '2026-09-28', created_at: '2026-09-28T10:00:00Z', status: 'completed' },
  { id: 'xfer-002', from_account_id: 'cacc-003', from_account_name: 'SBI Capex & Fleet Treasury', to_account_id: 'cacc-002', to_account_name: 'HDFC Corporate Operating A/c', amount_minor: 20000000, currency: 'INR', reference: 'RTGS-TR-0091', date: '2026-09-25', created_at: '2026-09-25T11:30:00Z', status: 'completed' },
  { id: 'xfer-003', from_account_id: 'cacc-002', from_account_name: 'HDFC Corporate Operating A/c', to_account_id: 'cacc-004', to_account_name: 'Petty Cash — HQ Workshop', amount_minor: 2500000, currency: 'INR', reference: 'SELF-CASH-71', date: '2026-09-29', created_at: '2026-09-29T09:15:00Z', status: 'completed' },
];

export const INITIAL_CASH_EXPECTED: CashExpected[] = [
  { id: 'expc-001', account_id: 'cacc-001', account_name: 'Site Cash — Metro Block A', expected_minor: 14500000, last_count_minor: 14500000, difference_minor: 0, status: 'balanced', updated_at: '2026-09-29T18:00:00Z' },
  { id: 'expc-002', account_id: 'cacc-004', account_name: 'Petty Cash — HQ Workshop', expected_minor: 4250000, last_count_minor: 4250000, difference_minor: 0, status: 'balanced', updated_at: '2026-09-29T18:00:00Z' },
];

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-001',
    ticket_number: 'TCK-2026-045',
    subject: 'Billing export CSV missing operator wage breakdown column',
    description: 'When exporting machine contribution CSV for Q3, the operator allowance is grouped with parts instead of labour. Please verify the contribution formula mapping.',
    status: 'open',
    priority: 'high',
    category: 'Billing & Reports',
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
  {
    id: 'tkt-002',
    ticket_number: 'TCK-2026-044',
    subject: 'Hydraulic pressure sensor calibration for EX-01',
    description: 'Telematics sensor triggered low pressure alert 190 bar yesterday during diaphragm trenching. Sensor recalibration requested for CAT 320D3.',
    status: 'pending',
    priority: 'medium',
    category: 'Hardware Telematics',
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'tkt-003',
    ticket_number: 'TCK-2026-043',
    subject: 'FASTag toll statement auto-sync for dump truck fleet',
    description: 'Can we link our commercial FASTag portal to automatically log tipper toll transactions into the expense ledger for Metro and Coastal road trips?',
    status: 'resolved',
    priority: 'medium',
    category: 'Integrations',
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: 'tkt-004',
    ticket_number: 'TCK-2026-042',
    subject: 'Request additional operator role login for Bangalore Metro site',
    description: 'Need to grant site supervisor access to Naveen Kumar for logging night shift work sessions and fuel bowser dispensing.',
    status: 'closed',
    priority: 'low',
    category: 'User Management',
    created_at: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_SAVED_PROJECTIONS: SavedProjection[] = [
  {
    id: 'proj-001',
    name: 'Bangalore Metro Phase 2 Excavation Package',
    machine_code: 'EX-01',
    working_days: 26,
    units_per_day: 8,
    rate_minor: 260000,
    currency: 'INR',
    projected_billing_minor: 54080000,
    projected_costs_minor: 20550400,
    projected_contribution_minor: 33529600,
    expense_ratio: 38,
    status: 'active',
  },
  {
    id: 'proj-002',
    name: 'Worli Coastal Road Reclamation Dozer',
    machine_code: 'DZ-01',
    working_days: 25,
    units_per_day: 7,
    rate_minor: 340000,
    currency: 'INR',
    projected_billing_minor: 59500000,
    projected_costs_minor: 23800000,
    projected_contribution_minor: 35700000,
    expense_ratio: 40,
    status: 'active',
  },
  {
    id: 'proj-003',
    name: 'Airport Terminal 2 Backhoe Loader Utility',
    machine_code: 'BL-01',
    working_days: 24,
    units_per_day: 6,
    rate_minor: 140000,
    currency: 'INR',
    projected_billing_minor: 20160000,
    projected_costs_minor: 7257600,
    projected_contribution_minor: 12902400,
    expense_ratio: 36,
    status: 'draft',
  },
];

export const INITIAL_ALERT_RULES: AlertRule[] = [
  { id: 'rul-1', name: 'Low Fuel Reserve Warning', entity: 'machines', metric: 'fuel_level_pct', comparator: '<', threshold: '15', threshold_unit: '%', severity: 'warning', active: true },
  { id: 'rul-2', name: 'Hydraulic Pressure Fluctuation', entity: 'machines', metric: 'hydraulic_pressure', comparator: '<', threshold: '200', threshold_unit: 'bar', severity: 'critical', active: true },
  { id: 'rul-3', name: 'Client Invoice Overdue', entity: 'receivables', metric: 'days_overdue', comparator: '>', threshold: '15', threshold_unit: 'days', severity: 'critical', active: true },
  { id: 'rul-4', name: 'Excessive Engine Idle Run', entity: 'work_sessions', metric: 'idle_hours', comparator: '>', threshold: '2.0', threshold_unit: 'hrs', severity: 'warning', active: true },
];

export const INITIAL_EXPENSE_CATEGORIES_OBJ: ExpenseCategory[] = [
  { id: 'cat-1', name: 'Fuel & Diesel', description: 'Bunk fills, bowser deliveries, and emergency top-ups' },
  { id: 'cat-2', name: 'Spare Parts', description: 'Filters, hoses, teeth, wear plates, and components' },
  { id: 'cat-3', name: 'Preventive Maintenance', description: '250h/500h/1000h servicing and mechanic visits' },
  { id: 'cat-4', name: 'Operator Allowance', description: 'Night shift, overtime, food, and mobilization allowances' },
  { id: 'cat-5', name: 'Toll & Road Permits', description: 'FASTag recharges, heavy trailer permits, pollution certs' },
  { id: 'cat-6', name: 'Insurance & Taxes', description: 'Commercial comprehensive vehicle insurance and road tax' },
  { id: 'cat-7', name: 'Oils & Lubricants', description: 'Tellus hydraulic oils, grease drums, and engine coolant' },
  { id: 'cat-8', name: 'Site Office & Misc', description: 'Office supplies, minor tools, and consumables' },
];

export const INITIAL_USERS = [
  { id: 'demo-owner-001', name: 'Ganesh P. (Owner)', email: 'owner@fleetech.io', role: 'owner', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'demo-ops-001', name: 'Karthik Raja (Ops Lead)', email: 'karthik@fleetech.io', role: 'ops', is_active: true, created_at: '2024-03-15T00:00:00Z' },
  { id: 'usr-003', name: 'Naveen Kumar (Site Supervisor)', email: 'naveen@fleetech.io', role: 'ops', is_active: true, created_at: '2024-06-20T00:00:00Z' },
  { id: 'usr-004', name: 'Priya Sharma (Financial Controller)', email: 'priya@fleetech.io', role: 'owner', is_active: true, created_at: '2024-08-10T00:00:00Z' },
];

export const INITIAL_PERIOD_CLOSES = [
  { period: '2026-08', closed_at: '2026-09-02T18:00:00Z', closed_by: 'owner@fleetech.io', status: 'closed' },
  { period: '2026-07', closed_at: '2026-08-03T17:30:00Z', closed_by: 'owner@fleetech.io', status: 'closed' },
];

export const INITIAL_TENANT_SETTINGS = {
  company_name: 'Fleet OS Infrastructure Logistics',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  fiscal_year_start: '04-01',
  auto_alerts_enabled: true,
  fx_defaults: {
    USD: { rate: 83.5 },
    EUR: { rate: 91.2 },
    AED: { rate: 22.7 },
  },
};

export const INITIAL_AUDIT_LOGS: AuditEntry[] = [
  { id: 'aud-001', table_name: 'work_sessions', operation: 'INSERT', record_id: 'ses-001', user_email: 'karthik@fleetech.io', data: { machine_id: 'mch-001', machine_code: 'EX-01', units_run: 6.0, activity: 'Deep trench excavation' }, created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
  { id: 'aud-002', table_name: 'fuel_logs', operation: 'INSERT', record_id: 'fuel-001', user_email: 'karthik@fleetech.io', data: { machine_id: 'mch-001', litres: 240, rate_per_litre: 89.5 }, created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString() },
  { id: 'aud-003', table_name: 'downtime_segments', operation: 'INSERT', record_id: 'dt-001', user_email: 'karthik@fleetech.io', data: { machine_id: 'mch-001', duration_hours: 1.5, reason: 'breakdown' }, created_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString() },
  { id: 'aud-004', table_name: 'client_money_events', operation: 'INSERT', record_id: 'cme-001', user_email: 'owner@fleetech.io', data: { client_id: 'cli-001', client_name: 'L&T Construction', amount_minor: 45000000, event_type: 'receipt' }, created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
  { id: 'aud-005', table_name: 'cash_transfers', operation: 'INSERT', record_id: 'xfer-001', user_email: 'owner@fleetech.io', data: { from_account: 'HDFC Corporate', to_account: 'Site Cash Metro', amount_minor: 5000000 }, created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString() },
  { id: 'aud-006', table_name: 'cash_counts', operation: 'INSERT', record_id: 'cnt-001', user_email: 'karthik@fleetech.io', data: { account_id: 'cacc-001', expected_balance: 145000, counted_balance: 145000 }, created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString() },
  { id: 'aud-007', table_name: 'maintenance_visits', operation: 'INSERT', record_id: 'vis-001', user_email: 'karthik@fleetech.io', data: { machine_id: 'mch-001', meter_at_service: 4000.0, parts_cost: 18500 }, created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString() },
  { id: 'aud-008', table_name: 'expenses', operation: 'INSERT', record_id: 'exp-001', user_email: 'karthik@fleetech.io', data: { category: 'Fuel', amount: 83140, vendor: 'Indian Oil' }, created_at: new Date(Date.now() - 84 * 3600 * 1000).toISOString() },
];

export const INITIAL_CLIENT_MONEY_EVENTS: ClientMoneyEvent[] = [
  { id: 'cme-001', client_id: 'cli-001', client_name: 'L&T Construction', event_type: 'receipt', amount_minor: 45000000, currency: 'INR', mode: 'rtgs', reference: 'RTGS-HDFC-9918231', event_date: '2026-09-20', created_by: 'demo-owner-001', created_at: '2026-09-20T11:00:00Z' },
  { id: 'cme-002', client_id: 'cli-002', client_name: 'Afcons Infrastructure Ltd', event_type: 'receipt', amount_minor: 35000000, currency: 'INR', mode: 'neft', reference: 'NEFT-ICIC-8827182', event_date: '2026-09-22', created_by: 'demo-owner-001', created_at: '2026-09-22T14:30:00Z' },
  { id: 'cme-003', client_id: 'cli-003', client_name: 'Tata Projects Ltd', event_type: 'advance', amount_minor: 30000000, currency: 'INR', mode: 'rtgs', reference: 'RTGS-SBI-7718290', event_date: '2026-09-25', created_by: 'demo-owner-001', created_at: '2026-09-25T16:00:00Z' },
];

export const INITIAL_WORK_SESSIONS: WorkSession[] = [
  {
    id: 'ses-001',
    machine_id: 'mch-001',
    machine_code: 'EX-01',
    deployment_id: 'dep-001',
    site_id: 'site-001',
    site_name: 'Bangalore Metro Phase 2 — Reach 6',
    operator_id: 'op-001',
    operator_name: 'Ramesh Kumar',
    start_at: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
    end_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    start_meter: 4274.5,
    end_meter: 4280.5,
    units_run: 6.0,
    idle_hours: 0.8,
    diesel_litres: 120,
    activity: 'Deep trench excavation for underground station diaphragm wall',
    billable: true,
    revenue: 15600,
    created_by: 'demo-owner-001',
    created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    is_current: true,
  },
  {
    id: 'ses-002',
    machine_id: 'mch-002',
    machine_code: 'EX-02',
    deployment_id: 'dep-002',
    site_id: 'site-001',
    site_name: 'Bangalore Metro Phase 2 — Reach 6',
    operator_id: 'op-002',
    operator_name: 'Suresh Yadav',
    start_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    end_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    start_meter: 3943.5,
    end_meter: 3950.0,
    units_run: 6.5,
    idle_hours: 0.5,
    diesel_litres: 110,
    activity: 'Breaking rock boulders with hydraulic breaker attachment',
    billable: true,
    revenue: 16250,
    created_by: 'demo-owner-001',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    is_current: true,
  },
  {
    id: 'ses-003',
    machine_id: 'mch-003',
    machine_code: 'DZ-01',
    deployment_id: 'dep-003',
    site_id: 'site-002',
    site_name: 'Coastal Roadway — Marine Drive to Worli',
    operator_id: 'op-003',
    operator_name: 'Abdul Karim',
    start_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    end_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    start_meter: 5615.0,
    end_meter: 5620.2,
    units_run: 5.2,
    idle_hours: 0.4,
    diesel_litres: 145,
    activity: 'Coastal embankment reclamation and boulder pushing',
    billable: true,
    revenue: 17680,
    created_by: 'demo-owner-001',
    created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    is_current: true,
  },
  {
    id: 'ses-004',
    machine_id: 'mch-004',
    machine_code: 'BL-01',
    deployment_id: 'dep-004',
    site_id: 'site-003',
    site_name: 'Kempegowda Airport Terminal 2 Expansion',
    operator_id: 'op-004',
    operator_name: 'Vikram Singh',
    start_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    end_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    start_meter: 1836.4,
    end_meter: 1840.4,
    units_run: 4.0,
    idle_hours: 0.6,
    diesel_litres: 48,
    activity: 'Optical fiber cable trenching and backfilling',
    billable: true,
    revenue: 5600,
    created_by: 'demo-owner-001',
    created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    is_current: true,
  },
  {
    id: 'ses-005',
    machine_id: 'mch-005',
    machine_code: 'WL-01',
    deployment_id: 'dep-005',
    site_id: 'site-002',
    site_name: 'Coastal Roadway — Marine Drive to Worli',
    operator_id: 'op-005',
    operator_name: 'Pradeep Sharma',
    start_at: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
    end_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    start_meter: 3205.0,
    end_meter: 3210.8,
    units_run: 5.8,
    idle_hours: 0.7,
    diesel_litres: 115,
    activity: 'Loading aggregate 40mm into dumper fleet',
    billable: true,
    revenue: 16820,
    created_by: 'demo-owner-001',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    is_current: true,
  },
  {
    id: 'ses-006',
    machine_id: 'mch-006',
    machine_code: 'DT-01',
    deployment_id: 'dep-006',
    site_id: 'site-001',
    site_name: 'Bangalore Metro Phase 2 — Reach 6',
    operator_id: 'op-006',
    operator_name: 'Manoj Gowda',
    start_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    end_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    start_meter: 48820,
    end_meter: 48920,
    units_run: 100,
    idle_hours: 1.2,
    diesel_litres: 75,
    activity: '6 trips: Muck disposal from Dairy Circle to Bidadi quarry',
    billable: true,
    revenue: 12250,
    created_by: 'demo-owner-001',
    created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    is_current: true,
  },
];

export const INITIAL_ALERTS: Alert[] = [
  {
    id: 'alt-001',
    severity: 'critical',
    title: 'Hydraulic Pressure Fluctuation',
    message: 'Excavator EX-01 main pump pressure dropped to 190 bar during deep trenching (nominal 350 bar). Immediate filter check recommended.',
    entity_type: 'machine',
    entity_id: 'mch-001',
    entity_name: 'EX-01 (CAT 320D3)',
    is_resolved: false,
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'alt-002',
    severity: 'critical',
    title: 'Client Payment Overdue',
    message: 'Invoice INV-2026-084 for ₹8,40,000 to L&T Construction is overdue by 18 days beyond the 30-day payment terms.',
    entity_type: 'billing',
    entity_id: 'cli-001',
    entity_name: 'L&T Construction',
    is_resolved: false,
    created_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
  },
  {
    id: 'alt-003',
    severity: 'warning',
    title: 'Fuel Reserve Low',
    message: 'Tipper DT-02 fuel level is below 15% reserve tank threshold at NH-44 Site. Diesel bunk top-up required before next shift.',
    entity_type: 'machine',
    entity_id: 'mch-007',
    entity_name: 'DT-02 (BharatBenz 2828C)',
    is_resolved: false,
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    id: 'alt-004',
    severity: 'warning',
    title: 'Operator License Expiry',
    message: 'Operator Ramesh Kumar heavy equipment driving license KA-05-2016-HE-00841 renewal due in 12 days.',
    entity_type: 'operator',
    entity_id: 'op-001',
    entity_name: 'Ramesh Kumar',
    is_resolved: false,
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'alt-005',
    severity: 'info',
    title: 'Service Overhaul In Progress',
    message: 'Soil Compactor SC-01 in maintenance bay for 2500hr scheduled vibration damper & engine service.',
    entity_type: 'machine',
    entity_id: 'mch-010',
    entity_name: 'SC-01 (Hamm 311D)',
    is_resolved: false,
    created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_FUEL_LOGS: FuelLog[] = [
  {
    id: 'fuel-001',
    machine_id: 'mch-001',
    machine_code: 'EX-01',
    site_id: 'site-001',
    litres: 240,
    rate_per_litre: 89.5,
    total_cost: 21480,
    meter_reading: 4274.5,
    bunk_name: 'Indian Oil Bowser — Site Tanker #1',
    created_by: 'demo-owner-001',
    fuelled_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: 'fuel-002',
    machine_id: 'mch-002',
    machine_code: 'EX-02',
    site_id: 'site-001',
    litres: 200,
    rate_per_litre: 89.5,
    total_cost: 17900,
    meter_reading: 3943.5,
    bunk_name: 'Indian Oil Bowser — Site Tanker #1',
    created_by: 'demo-owner-001',
    fuelled_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
  },
  {
    id: 'fuel-003',
    machine_id: 'mch-003',
    machine_code: 'DZ-01',
    site_id: 'site-002',
    litres: 320,
    rate_per_litre: 92.0,
    total_cost: 29440,
    meter_reading: 5615.0,
    bunk_name: 'HPCL Worli Sea Face Auto Fuel Station',
    created_by: 'demo-owner-001',
    fuelled_at: new Date(Date.now() - 16 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 16 * 3600 * 1000).toISOString(),
  },
  {
    id: 'fuel-004',
    machine_id: 'mch-006',
    machine_code: 'DT-01',
    site_id: 'site-001',
    litres: 160,
    rate_per_litre: 89.5,
    total_cost: 14320,
    meter_reading: 48820,
    bunk_name: 'BPCL Adugodi Commercial Bunk',
    created_by: 'demo-owner-001',
    fuelled_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_DOWNTIME: DowntimeSegment[] = [
  {
    id: 'dt-001',
    machine_id: 'mch-001',
    machine_code: 'EX-01',
    site_id: 'site-001',
    reason: 'breakdown',
    reason_code: 'hydraulic_leak',
    notes: 'Hydraulic main line O-ring seal burst during heavy trenching. Replaced seal and topped up 20L Tellus S2 oil.',
    duration_hours: 1.5,
    started_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    ended_at: new Date(Date.now() - 18.5 * 3600 * 1000).toISOString(),
    created_by: 'demo-owner-001',
    created_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
  },
  {
    id: 'dt-002',
    machine_id: 'mch-006',
    machine_code: 'DT-01',
    site_id: 'site-001',
    reason: 'breakdown',
    reason_code: 'tire_puncture',
    notes: 'Rear right double tire puncture on disposal route. Spare wheel fitted by mobile tyre helper.',
    duration_hours: 1.0,
    started_at: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    ended_at: new Date(Date.now() - 27 * 3600 * 1000).toISOString(),
    created_by: 'demo-owner-001',
    created_at: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_MAINTENANCE_TASKS: MaintenanceTask[] = [
  { id: 'tsk-001', title: '250hr Lubrication & Grease Service', interval_hours: 250, category: 'Preventive', description: 'Complete chassis, boom pins, bucket linkages, and turntable bearing greasing.' },
  { id: 'tsk-002', title: '500hr Engine Oil & Filter Replacement', interval_hours: 500, category: 'Engine', description: 'Replace 15W-40 CI-4 engine oil, primary oil filter, and secondary bypass filter.' },
  { id: 'tsk-003', title: '1000hr Fuel & Hydraulic Filtration', interval_hours: 1000, category: 'Hydraulic', description: 'Replace main hydraulic return filter, suction strainer clean, fuel-water separator.' },
  { id: 'tsk-004', title: '2000hr Final Drive & Transmission Flush', interval_hours: 2000, category: 'Drivetrain', description: 'Drain and replenish planetary final drives and swing motor gear reduction box.' },
];

export const INITIAL_MAINTENANCE_VISITS: MaintenanceVisit[] = [
  {
    id: 'vis-001',
    machine_id: 'mch-001',
    machine_code: 'EX-01',
    visit_date: '2026-09-15',
    performed_by: 'GMMCO Certified Cat Technician',
    meter_at_service: 4000.0,
    tasks_completed: ['500hr Engine Oil & Filter', 'Air cleaner primary element blowout', 'Coolant level top-up'],
    parts_cost: 18500,
    labour_cost: 4500,
    notes: 'Engine running smoothly. Valve lash check verified within factory tolerance.',
    created_by: 'demo-owner-001',
    created_at: '2026-09-15T14:00:00Z',
  },
  {
    id: 'vis-002',
    machine_id: 'mch-004',
    machine_code: 'BL-01',
    visit_date: '2026-09-20',
    performed_by: 'JCB Dealer Mobile Van',
    meter_at_service: 1750.0,
    tasks_completed: ['250hr Grease Service', 'Brake fluid check', 'Fan belt tension adjustment'],
    parts_cost: 3200,
    labour_cost: 2000,
    notes: 'All grease nipples accepting grease freely. Front axle hub oil inspected.',
    created_by: 'demo-owner-001',
    created_at: '2026-09-20T11:30:00Z',
  },
];

export const INITIAL_EXPENSES: Expense[] = [
  { id: 'exp-001', category: 'Fuel & Diesel', category_name: 'Fuel & Diesel', amount: 83140, amount_minor: 8314000, vendor: 'Indian Oil Corp', site_id: 'site-001', date: '2026-09-28', notes: 'Diesel batch delivery 928 Litres for Metro Site batching plant', created_by: 'demo-owner-001', created_at: '2026-09-28T10:00:00Z' },
  { id: 'exp-002', category: 'Spare Parts', category_name: 'Spare Parts', amount: 24500, amount_minor: 2450000, vendor: 'GMMCO Cat Spares', machine_id: 'mch-001', date: '2026-09-27', notes: 'Hydraulic pressure seals and 2 sets bucket tooth tips', created_by: 'demo-owner-001', created_at: '2026-09-27T11:00:00Z' },
  { id: 'exp-003', category: 'Toll & Road Permits', category_name: 'Toll & Road Permits', amount: 6800, amount_minor: 680000, vendor: 'NHAI FASTag', machine_id: 'mch-006', date: '2026-09-29', notes: 'Tipper FASTag auto-recharge for disposal trips', created_by: 'demo-owner-001', created_at: '2026-09-29T12:00:00Z' },
  { id: 'exp-004', category: 'Operator Allowance', category_name: 'Operator Allowance', amount: 15000, amount_minor: 1500000, vendor: 'Petty Cash Voucher #412', site_id: 'site-002', date: '2026-09-29', notes: 'Night shift meal and mobilization allowance for Worli coastal crew', created_by: 'demo-owner-001', created_at: '2026-09-29T14:00:00Z' },
];

export const INITIAL_EXPENSE_CATEGORIES = INITIAL_EXPENSE_CATEGORIES_OBJ.map((c) => c.name);
