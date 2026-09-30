/**
 * Comprehensive Fleet OS Domain Dataset
 * Required by cards, components, and pages across the entire application:
 * - Dashboard KPIs, Radial Timeline, Fleet Status, Needs Attention, Activity Tables
 * - Machines, Sites, Clients, Operators, Deployments
 * - Work Sessions, Fuel Logs, Downtime, Maintenance
 * - Billing (KPIs, Receivables, Unused Advances, Ledger)
 * - Cash Accounts, Reconciliations, Transfers
 * - Alerts, Expenses, Users, Audit Logs, and AI Insights
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
  phone: string;
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
  license_number: string;
  experience_years: number;
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

export interface Receivable {
  id: string;
  invoice_number: string;
  client_id: string;
  client_name: string;
  amount_minor: number;
  issued_at: string;
  due_at: string;
  status: 'pending' | 'overdue' | 'paid';
  site_name?: string;
}

export interface UnusedAdvance {
  id: string;
  client_id: string;
  client_name: string;
  amount_minor: number;
  received_at: string;
  reference: string;
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
  fuelled_at: string;
}

export interface DowntimeSegment {
  id: string;
  machine_id: string;
  machine_code: string;
  site_id: string;
  reason: 'breakdown' | 'no_diesel' | 'weather' | 'transport' | 'service';
  notes: string;
  duration_hours: number;
  started_at: string;
  ended_at?: string;
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
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  vendor: string;
  site_id?: string;
  machine_id?: string;
  date: string;
  notes: string;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * INITIAL STATIC DATASET
 * ───────────────────────────────────────────────────────────────────────────── */

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-001',
    name: 'L&T Construction',
    contact_person: 'Mr. Arvind Swamy',
    phone: '+91 98450 12345',
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
    phone: '+91 99201 67890',
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
    phone: '+91 98230 45678',
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
    phone: '+91 98190 87654',
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
    phone: '+91 97555 11223',
    email: 'devendra.s@dilipbuildcon.co.in',
    address: 'Plot No. 5, Inside Govind Narayan Singh Gate, Chuna Bhatti, Kolar Rd, Bhopal',
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
    phone: '+91 98490 33445',
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
  {
    id: 'cli-007',
    name: 'GMR Infrastructure',
    contact_person: 'Mr. Prakash Hegde',
    phone: '+91 99002 99887',
    email: 'prakash.hegde@gmrgroup.in',
    address: 'GMR Aero Towers, Rajiv Gandhi International Airport, Shamshabad',
    currency: 'INR',
    payment_terms_days: 30,
    total_projects: 1,
    total_revenue: 210000000,
    outstanding_balance: 42000000,
    status: 'active',
    created_at: '2025-07-04T12:00:00Z',
  },
  {
    id: 'cli-008',
    name: 'JMC Projects Ltd',
    contact_person: 'Mr. Brijesh Patel',
    phone: '+91 98250 66778',
    email: 'brijesh.patel@jmcprojects.com',
    address: 'Kalpataru Synergy, Opp. Grand Hyatt, Santacruz East, Mumbai',
    currency: 'INR',
    payment_terms_days: 30,
    total_projects: 1,
    total_revenue: 110000000,
    outstanding_balance: 18000000,
    status: 'active',
    created_at: '2025-08-14T10:10:00Z',
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
  {
    id: 'site-006',
    client_id: 'cli-006',
    client_name: 'NCC Urban Infrastructure',
    name: 'NCC Park View Commercial Tower',
    location: 'Yelahanka Satellite Town, Bengaluru',
    address: 'Major Sandeep Unnikrishnan Rd, Yelahanka, Bengaluru 560064',
    lat: 13.1007,
    lng: 77.5963,
    status: 'on_hold',
    start_date: '2025-06-25',
    site_manager: 'Venkatesh Babu',
    manager_phone: '+91 99452 33441',
    active_machines_count: 0,
    created_at: '2025-06-25T09:15:00Z',
  },
];

export const INITIAL_OPERATORS: Operator[] = [
  {
    id: 'op-001',
    name: 'Ramesh Kumar',
    phone: '+91 98451 11223',
    email: 'ramesh.k@fleetteam.in',
    license_number: 'KA-05-2016-HE-00841',
    experience_years: 9,
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
    license_number: 'MH-03-2018-HE-00192',
    experience_years: 7,
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
    license_number: 'KA-01-2015-HE-00912',
    experience_years: 11,
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
    license_number: 'DL-04-2019-HE-00311',
    experience_years: 6,
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
    license_number: 'MP-09-2017-HE-00420',
    experience_years: 8,
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
    license_number: 'KA-51-2020-HMV-00124',
    experience_years: 5,
    hourly_wage: 280,
    rating: 4.6,
    assigned_machine_id: 'mch-006',
    assigned_machine_code: 'DT-01',
    is_active: true,
    status: 'on_shift',
    created_at: '2024-12-01T08:00:00Z',
  },
  {
    id: 'op-007',
    name: 'Rajesh Nayak',
    phone: '+91 98440 77889',
    email: 'rajesh.n@fleetteam.in',
    license_number: 'KA-20-2019-HMV-00877',
    experience_years: 6,
    hourly_wage: 290,
    rating: 4.7,
    assigned_machine_id: 'mch-007',
    assigned_machine_code: 'DT-02',
    is_active: true,
    status: 'on_shift',
    created_at: '2024-12-01T08:00:00Z',
  },
  {
    id: 'op-008',
    name: 'Anand Patil',
    phone: '+91 98220 88990',
    email: 'anand.p@fleetteam.in',
    license_number: 'MH-12-2014-HE-00551',
    experience_years: 12,
    hourly_wage: 420,
    rating: 4.9,
    assigned_machine_id: 'mch-008',
    assigned_machine_code: 'MG-01',
    is_active: true,
    status: 'available',
    created_at: '2024-11-15T08:00:00Z',
  },
  {
    id: 'op-009',
    name: 'Suniel Verma',
    phone: '+91 98100 99001',
    email: 'suniel.v@fleetteam.in',
    license_number: 'UP-32-2013-CR-00778',
    experience_years: 13,
    hourly_wage: 450,
    rating: 5.0,
    assigned_machine_id: 'mch-009',
    assigned_machine_code: 'CR-01',
    is_active: true,
    status: 'on_shift',
    created_at: '2024-11-15T08:00:00Z',
  },
  {
    id: 'op-010',
    name: 'Devendra Rao',
    phone: '+91 98480 11992',
    email: 'devendra.r@fleetteam.in',
    license_number: 'TS-09-2021-HE-00234',
    experience_years: 4,
    hourly_wage: 270,
    rating: 4.5,
    assigned_machine_id: 'mch-010',
    assigned_machine_code: 'SC-01',
    is_active: true,
    status: 'on_leave',
    created_at: '2025-01-05T08:00:00Z',
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
    operator_id: 'op-007',
    operator_name: 'Rajesh Nayak',
    fuel_capacity_litres: 280,
    fuel_level_pct: 12, // triggers low fuel warning alert!
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
    operator_id: 'op-008',
    operator_name: 'Anand Patil',
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
    operator_id: 'op-009',
    operator_name: 'Suniel Verma',
    fuel_capacity_litres: 350,
    fuel_level_pct: 91,
    created_at: '2024-10-30T11:00:00Z',
  },
  {
    id: 'mch-010',
    code: 'SC-01',
    type: 'compactor',
    make: 'Hamm',
    model: '311D Soil Vibratory Compactor 11T',
    year: 2023,
    chassis_no: 'HAMM311D2023771',
    primary_meter_type: 'hours',
    meter_unit_label: 'Hours',
    current_meter: 2480.0,
    status_flag: 'service',
    flag_note: 'Scheduled 2500hr drum vibration damper overhaul',
    hourly_rate: 1600,
    site_id: 'site-004',
    site_name: 'Prestige Tech Cloud — Phase 4 Foundation',
    client_id: 'cli-004',
    client_name: 'Shapoorji Pallonji & Co',
    operator_id: 'op-010',
    operator_name: 'Devendra Rao',
    fuel_capacity_litres: 240,
    fuel_level_pct: 45,
    created_at: '2024-11-20T12:00:00Z',
  },
  {
    id: 'mch-011',
    code: 'EX-03',
    type: 'excavator',
    make: 'Volvo',
    model: 'EC210D Prime Excavator',
    year: 2024,
    chassis_no: 'VCE0EC210D99812',
    primary_meter_type: 'hours',
    meter_unit_label: 'Hours',
    current_meter: 1120.4,
    status_flag: 'active',
    flag_note: 'Apron grading at North runway',
    hourly_rate: 2500,
    site_id: 'site-003',
    site_name: 'Kempegowda Airport Terminal 2 Expansion',
    client_id: 'cli-003',
    client_name: 'Tata Projects Ltd',
    fuel_capacity_litres: 375,
    fuel_level_pct: 80,
    created_at: '2025-01-10T10:00:00Z',
  },
  {
    id: 'mch-012',
    code: 'DT-03',
    type: 'dump_truck',
    make: 'Tata Motors',
    model: 'Prima 2830.K Heavy Tipper 16 Cu.M',
    year: 2024,
    chassis_no: 'MAT428030P9K9941',
    primary_meter_type: 'km',
    meter_unit_label: 'Km',
    current_meter: 18450,
    status_flag: 'transit',
    flag_note: 'Mobilisation transit from Central Garage to Marine Drive Site',
    hourly_rate: 1750,
    site_id: 'site-002',
    site_name: 'Coastal Roadway — Marine Drive to Worli',
    client_id: 'cli-002',
    client_name: 'Afcons Infrastructure Ltd',
    fuel_capacity_litres: 300,
    fuel_level_pct: 85,
    created_at: '2025-01-15T09:00:00Z',
  },
];

export const INITIAL_DEPLOYMENTS: Deployment[] = [
  {
    id: 'dep-001',
    machine_id: 'mch-001',
    machine_code: 'EX-01',
    site_id: 'site-001',
    site_name: 'Bangalore Metro Phase 2 — Reach 6',
    client_id: 'cli-001',
    client_name: 'L&T Construction',
    operator_id: 'op-001',
    start_date: '2025-01-20',
    daily_rate: 20800,
    status: 'active',
    created_at: '2025-01-20T08:00:00Z',
  },
  {
    id: 'dep-002',
    machine_id: 'mch-002',
    machine_code: 'EX-02',
    site_id: 'site-001',
    site_name: 'Bangalore Metro Phase 2 — Reach 6',
    client_id: 'cli-001',
    client_name: 'L&T Construction',
    operator_id: 'op-002',
    start_date: '2025-01-20',
    daily_rate: 20000,
    status: 'active',
    created_at: '2025-01-20T08:00:00Z',
  },
  {
    id: 'dep-003',
    machine_id: 'mch-003',
    machine_code: 'DZ-01',
    site_id: 'site-002',
    site_name: 'Coastal Roadway — Marine Drive to Worli',
    client_id: 'cli-002',
    client_name: 'Afcons Infrastructure Ltd',
    operator_id: 'op-003',
    start_date: '2025-02-15',
    daily_rate: 27200,
    status: 'active',
    created_at: '2025-02-15T09:00:00Z',
  },
  {
    id: 'dep-004',
    machine_id: 'mch-004',
    machine_code: 'BL-01',
    site_id: 'site-003',
    site_name: 'Kempegowda Airport Terminal 2 Expansion',
    client_id: 'cli-003',
    client_name: 'Tata Projects Ltd',
    operator_id: 'op-004',
    start_date: '2025-03-10',
    daily_rate: 11200,
    status: 'active',
    created_at: '2025-03-10T10:00:00Z',
  },
  {
    id: 'dep-005',
    machine_id: 'mch-005',
    machine_code: 'WL-01',
    site_id: 'site-002',
    site_name: 'Coastal Roadway — Marine Drive to Worli',
    client_id: 'cli-002',
    client_name: 'Afcons Infrastructure Ltd',
    operator_id: 'op-005',
    start_date: '2025-02-15',
    daily_rate: 23200,
    status: 'active',
    created_at: '2025-02-15T09:00:00Z',
  },
  {
    id: 'dep-006',
    machine_id: 'mch-006',
    machine_code: 'DT-01',
    site_id: 'site-001',
    site_name: 'Bangalore Metro Phase 2 — Reach 6',
    client_id: 'cli-001',
    client_name: 'L&T Construction',
    operator_id: 'op-006',
    start_date: '2025-01-20',
    daily_rate: 14000,
    status: 'active',
    created_at: '2025-01-20T08:00:00Z',
  },
  {
    id: 'dep-007',
    machine_id: 'mch-007',
    machine_code: 'DT-02',
    site_id: 'site-005',
    site_name: 'NH-44 Highway Six-Laning Package 1',
    client_id: 'cli-005',
    client_name: 'Dilip Buildcon Ltd',
    operator_id: 'op-007',
    start_date: '2025-05-20',
    daily_rate: 14000,
    status: 'active',
    created_at: '2025-05-20T08:30:00Z',
  },
  {
    id: 'dep-008',
    machine_id: 'mch-008',
    machine_code: 'MG-01',
    site_id: 'site-005',
    site_name: 'NH-44 Highway Six-Laning Package 1',
    client_id: 'cli-005',
    client_name: 'Dilip Buildcon Ltd',
    operator_id: 'op-008',
    start_date: '2025-05-20',
    daily_rate: 24800,
    status: 'active',
    created_at: '2025-05-20T08:30:00Z',
  },
  {
    id: 'dep-009',
    machine_id: 'mch-009',
    machine_code: 'CR-01',
    site_id: 'site-001',
    site_name: 'Bangalore Metro Phase 2 — Reach 6',
    client_id: 'cli-001',
    client_name: 'L&T Construction',
    operator_id: 'op-009',
    start_date: '2025-01-20',
    daily_rate: 36000,
    status: 'active',
    created_at: '2025-01-20T08:00:00Z',
  },
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
    units_run: 100, // 100 km run
    idle_hours: 1.2,
    diesel_litres: 75,
    activity: '6 trips: Muck disposal from Dairy Circle to Bidadi quarry',
    billable: true,
    revenue: 12250,
    created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    is_current: true,
  },
  {
    id: 'ses-007',
    machine_id: 'mch-008',
    machine_code: 'MG-01',
    deployment_id: 'dep-008',
    site_id: 'site-005',
    site_name: 'NH-44 Highway Six-Laning Package 1',
    operator_id: 'op-008',
    operator_name: 'Anand Patil',
    start_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    end_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    start_meter: 3734.0,
    end_meter: 3740.0,
    units_run: 6.0,
    idle_hours: 0.5,
    diesel_litres: 95,
    activity: 'Spreading wet mix macadam (WMM) on right carriageway',
    billable: true,
    revenue: 18600,
    created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    is_current: true,
  },
  {
    id: 'ses-008',
    machine_id: 'mch-009',
    machine_code: 'CR-01',
    deployment_id: 'dep-009',
    site_id: 'site-001',
    site_name: 'Bangalore Metro Phase 2 — Reach 6',
    operator_id: 'op-009',
    operator_name: 'Suniel Verma',
    start_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    end_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    start_meter: 2146.6,
    end_meter: 2150.6,
    units_run: 4.0,
    idle_hours: 1.0,
    diesel_litres: 60,
    activity: 'Lifting rebar cages into diaphragm trench',
    billable: true,
    revenue: 18000,
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

export const INITIAL_CASH_ACCOUNTS: CashAccount[] = [
  {
    id: 'cacc-001',
    name: 'Site Cash — Metro Block A',
    type: 'site_cash',
    balance: 145000,
    currency: 'INR',
    site_id: 'site-001',
    created_at: '2025-01-20T08:00:00Z',
  },
  {
    id: 'cacc-002',
    name: 'HDFC Corporate Operating A/c',
    type: 'bank',
    balance: 4820000,
    currency: 'INR',
    account_number: '50200049281744',
    created_at: '2024-10-01T08:00:00Z',
  },
  {
    id: 'cacc-003',
    name: 'SBI Capex & Fleet Treasury',
    type: 'bank',
    balance: 2250000,
    currency: 'INR',
    account_number: '39281048192',
    created_at: '2024-10-01T08:00:00Z',
  },
  {
    id: 'cacc-004',
    name: 'Petty Cash — HQ Garage & Workshop',
    type: 'petty',
    balance: 42500,
    currency: 'INR',
    created_at: '2025-01-01T08:00:00Z',
  },
];

export const INITIAL_RECEIVABLES: Receivable[] = [
  {
    id: 'rec-001',
    invoice_number: 'INV-2026-084',
    client_id: 'cli-001',
    client_name: 'L&T Construction',
    amount_minor: 84000000, // ₹8,40,000
    issued_at: '2026-08-10',
    due_at: '2026-09-10',
    status: 'overdue',
    site_name: 'Bangalore Metro Phase 2 — Reach 6',
  },
  {
    id: 'rec-002',
    invoice_number: 'INV-2026-088',
    client_id: 'cli-002',
    client_name: 'Afcons Infrastructure Ltd',
    amount_minor: 62000000, // ₹6,20,000
    issued_at: '2026-08-25',
    due_at: '2026-10-10',
    status: 'pending',
    site_name: 'Coastal Roadway — Marine Drive to Worli',
  },
  {
    id: 'rec-003',
    invoice_number: 'INV-2026-089',
    client_id: 'cli-003',
    client_name: 'Tata Projects Ltd',
    amount_minor: 45000000, // ₹4,50,000
    issued_at: '2026-09-01',
    due_at: '2026-10-01',
    status: 'pending',
    site_name: 'Kempegowda Airport Terminal 2 Expansion',
  },
  {
    id: 'rec-004',
    invoice_number: 'INV-2026-090',
    client_id: 'cli-005',
    client_name: 'Dilip Buildcon Ltd',
    amount_minor: 51000000, // ₹5,10,000
    issued_at: '2026-09-05',
    due_at: '2026-10-05',
    status: 'pending',
    site_name: 'NH-44 Highway Six-Laning Package 1',
  },
  {
    id: 'rec-005',
    invoice_number: 'INV-2026-091',
    client_id: 'cli-004',
    client_name: 'Shapoorji Pallonji & Co',
    amount_minor: 38000000, // ₹3,80,000
    issued_at: '2026-08-15',
    due_at: '2026-10-15',
    status: 'pending',
    site_name: 'Prestige Tech Cloud — Phase 4 Foundation',
  },
];

export const INITIAL_UNUSED_ADVANCES: UnusedAdvance[] = [
  {
    id: 'adv-001',
    client_id: 'cli-001',
    client_name: 'L&T Construction',
    amount_minor: 45000000, // ₹4,50,000
    received_at: '2026-09-01',
    reference: 'RTGS-HDFC-9918231',
  },
  {
    id: 'adv-002',
    client_id: 'cli-003',
    client_name: 'Tata Projects Ltd',
    amount_minor: 30000000, // ₹3,00,000
    received_at: '2026-09-12',
    reference: 'NEFT-ICIC-8827182',
  },
  {
    id: 'adv-003',
    client_id: 'cli-007',
    client_name: 'GMR Infrastructure',
    amount_minor: 20000000, // ₹2,00,000
    received_at: '2026-09-18',
    reference: 'IMPS-SBI-7726190',
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
    fuelled_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
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
    fuelled_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
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
    fuelled_at: new Date(Date.now() - 16 * 3600 * 1000).toISOString(),
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
    fuelled_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_DOWNTIME: DowntimeSegment[] = [
  {
    id: 'dt-001',
    machine_id: 'mch-001',
    machine_code: 'EX-01',
    site_id: 'site-001',
    reason: 'breakdown',
    notes: 'Hydraulic main line O-ring seal burst during heavy trenching. Replaced seal and topped up 20L Tellus S2 oil.',
    duration_hours: 1.5,
    started_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    ended_at: new Date(Date.now() - 18.5 * 3600 * 1000).toISOString(),
  },
  {
    id: 'dt-002',
    machine_id: 'mch-006',
    machine_code: 'DT-01',
    site_id: 'site-001',
    reason: 'breakdown',
    notes: 'Rear right double tire puncture on disposal route. Spare wheel fitted by mobile tyre helper.',
    duration_hours: 1.0,
    started_at: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    ended_at: new Date(Date.now() - 27 * 3600 * 1000).toISOString(),
  },
  {
    id: 'dt-003',
    machine_id: 'mch-005',
    machine_code: 'WL-01',
    site_id: 'site-002',
    reason: 'weather',
    notes: 'High tidal surge and torrential rain pause mandated by Mumbai Municipal safety inspector.',
    duration_hours: 2.5,
    started_at: new Date(Date.now() - 32 * 3600 * 1000).toISOString(),
    ended_at: new Date(Date.now() - 29.5 * 3600 * 1000).toISOString(),
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
  },
];

export const INITIAL_EXPENSES: Expense[] = [
  { id: 'exp-001', category: 'Fuel', amount: 83140, vendor: 'Indian Oil Corp', site_id: 'site-001', date: '2026-09-28', notes: 'Diesel batch delivery 928 Litres for Metro Site batching plant' },
  { id: 'exp-002', category: 'Spare Parts', amount: 24500, vendor: 'GMMCO Cat Spares', machine_id: 'mch-001', date: '2026-09-27', notes: 'Hydraulic pressure seals and 2 sets bucket tooth tips' },
  { id: 'exp-003', category: 'Toll & Permits', amount: 6800, vendor: 'NHAI FASTag', machine_id: 'mch-006', date: '2026-09-29', notes: 'Tipper FASTag auto-recharge for disposal trips' },
  { id: 'exp-004', category: 'Operator Allowance', amount: 15000, vendor: 'Petty Cash Voucher #412', site_id: 'site-002', date: '2026-09-29', notes: 'Night shift meal and mobilization allowance for Worli coastal crew' },
];

export const INITIAL_EXPENSE_CATEGORIES = [
  'Fuel',
  'Spare Parts',
  'Maintenance & Repairs',
  'Operator Allowance',
  'Toll & Permits',
  'Insurance & Fitness',
  'Consumables & Lubricants',
  'Site Office & Misc',
];

export const INITIAL_USERS = [
  { id: 'usr-001', name: 'Ganesh P. (Owner)', email: 'owner@fleetech.io', role: 'owner', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'usr-002', name: 'Karthik Raja (Ops Lead)', email: 'karthik@fleetech.io', role: 'ops', is_active: true, created_at: '2024-03-15T00:00:00Z' },
  { id: 'usr-003', name: 'Naveen Kumar (Fleet Auditor)', email: 'naveen@fleetech.io', role: 'ops', is_active: true, created_at: '2024-06-20T00:00:00Z' },
];

export const INITIAL_SUPPORT_TICKETS = [
  {
    id: 'tkt-001',
    ticket_number: 'TCK-2026-042',
    subject: 'Request FASTag Monthly Toll Statement Integration',
    status: 'open',
    priority: 'medium',
    category: 'Billing & Tolls',
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    messages: [
      { sender: 'user', text: 'Can we automatically import FASTag toll transactions into machine expense logs?', at: new Date(Date.now() - 48 * 3600 * 1000).toISOString() },
      { sender: 'support', text: 'Hi Ganesh, FASTag API integration via NPCI is currently in pilot. We can set up daily CSV ingestion for your fleet tippers.', at: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
    ],
  },
  {
    id: 'tkt-002',
    ticket_number: 'TCK-2026-039',
    subject: 'Telemetry GPS lag on Volvo Wheel Loader WL-01',
    status: 'resolved',
    priority: 'low',
    category: 'Hardware Telematics',
    created_at: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
    messages: [
      { sender: 'user', text: 'WL-01 coordinates were lagging by 2 hours yesterday during coastal road operations.', at: new Date(Date.now() - 96 * 3600 * 1000).toISOString() },
      { sender: 'support', text: 'Firmware v2.4.1 flashed OTA to the OBD-II tracker. Telemetry ping frequency reset to 30 seconds. Resolved.', at: new Date(Date.now() - 72 * 3600 * 1000).toISOString() },
    ],
  },
];

export const INITIAL_AUDIT_LOGS = [
  { id: 'aud-001', action: 'CREATE', entity: 'work_sessions', entity_id: 'ses-001', performed_by: 'karthik@fleetech.io', details: 'Logged 6.0 engine hours for EX-01 on Metro Pier excavation', created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString() },
  { id: 'aud-002', action: 'UPDATE', entity: 'machines', entity_id: 'mch-007', performed_by: 'karthik@fleetech.io', details: 'Status updated to Idle (low diesel fuel warning)', created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString() },
  { id: 'aud-003', action: 'CREATE', entity: 'fuel_logs', entity_id: 'fuel-001', performed_by: 'karthik@fleetech.io', details: 'Dispensed 240L diesel to EX-01 @ ₹89.5/L', created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString() },
  { id: 'aud-004', action: 'CREATE', entity: 'invoices', entity_id: 'rec-001', performed_by: 'owner@fleetech.io', details: 'Generated billing invoice INV-2026-084 for L&T Construction (₹8,40,000)', created_at: '2026-08-10T11:00:00Z' },
  { id: 'aud-005', action: 'APPROVE', entity: 'cash_counts', entity_id: 'cacc-001', performed_by: 'owner@fleetech.io', details: 'Physical cash verified ₹1,45,000 at Metro Block A Site', created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
];
