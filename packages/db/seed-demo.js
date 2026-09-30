#!/usr/bin/env node
/**
 * Demo Database Seeding Script for Fleet OS
 * Populates PostgreSQL / Neon database with the complete rich fleet dataset
 * required by all cards, components, and pages.
 *
 * Run: node packages/db/seed-demo.js
 */

const path = require('path');
const fs = require('fs');
const { Client } = require('pg');
const { randomUUID } = require('crypto');

// Load .env from repo root
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8');
  for (const line of env.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

const config = process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'fleetos',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    };

const TENANT_ID = '00000000-0000-0000-0000-000000000001';
const OWNER_ID = '00000000-0000-0000-0000-000000000010';

async function seedDemo() {
  const client = new Client(config);
  await client.connect();

  console.log('🚀 Seeding comprehensive fleet dataset into PostgreSQL...');

  try {
    // 1. Ensure demo tenant exists in platform.tenants
    await client.query(`
      INSERT INTO platform.tenants (id, name, slug, status)
      VALUES ($1, 'Fleet OS Infrastructure Logistics', 'demo-fleet', 'active')
      ON CONFLICT (id) DO NOTHING;
    `, [TENANT_ID]);

    // 2. Set RLS context for session
    await client.query(`SET app.tenant_id = '${TENANT_ID}';`);
    await client.query(`SET ROLE app_owner;`);

    // 3. Insert Clients
    console.log('📦 Seeding clients...');
    const clientRows = [
      ['00000000-0000-0000-0001-000000000001', 'L&T Construction', 'Mr. Arvind Swamy', '+91 98450 12345', 'L&T Manapakkam Campus, Chennai', 'INR', 30],
      ['00000000-0000-0000-0001-000000000002', 'Afcons Infrastructure Ltd', 'Mr. Rajeshwar Rao', '+91 99201 67890', 'Afcons House, Andheri West, Mumbai', 'INR', 45],
      ['00000000-0000-0000-0001-000000000003', 'Tata Projects Ltd', 'Ms. Sunita Deshmukh', '+91 98230 45678', 'Hiranandani Business Park, Powai, Mumbai', 'INR', 30],
      ['00000000-0000-0000-0001-000000000004', 'Shapoorji Pallonji & Co', 'Mr. Farokh Mehta', '+91 98190 87654', 'SP Centre, Colaba, Mumbai', 'INR', 60],
      ['00000000-0000-0000-0001-000000000005', 'Dilip Buildcon Ltd', 'Mr. Devendra Suryavanshi', '+91 97555 11223', 'Chuna Bhatti, Kolar Rd, Bhopal', 'INR', 30],
    ];

    for (const [id, name, contact, phone, address, currency, terms] of clientRows) {
      await client.query(`
        INSERT INTO tenant.clients (id, tenant_id, name, contact, phone, address, currency, payment_terms_days, client_uuid)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, gen_random_uuid())
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, contact = EXCLUDED.contact;
      `, [id, TENANT_ID, name, contact, phone, address, currency, terms]);
    }

    // 4. Insert Sites
    console.log('🏗️ Seeding sites...');
    const siteRows = [
      ['00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001', 'Bangalore Metro Phase 2 — Reach 6', 'Dairy Circle to Nagawara Underground, Bengaluru', 12.9345, 77.6012],
      ['00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000002', 'Coastal Roadway — Marine Drive to Worli', 'Package II, Worli Sea Face, Mumbai', 19.0144, 72.8179],
      ['00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0001-000000000003', 'Kempegowda Airport Terminal 2 Expansion', 'North Airfield Runway Extension, Devanahalli', 13.1986, 77.7066],
      ['00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0001-000000000004', 'Prestige Tech Cloud — Phase 4 Foundation', 'Outer Ring Road, Kadubeesanahalli, Bengaluru', 12.9372, 77.6974],
      ['00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0001-000000000005', 'NH-44 Highway Six-Laning Package 1', 'Hosur to Krishnagiri Expressway Corridor', 12.5186, 78.2138],
    ];

    for (const [id, clientId, name, loc, lat, lng] of siteRows) {
      await client.query(`
        INSERT INTO tenant.sites (id, tenant_id, client_id, name, location, lat, lng, start_date, client_uuid)
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE - INTERVAL '180 days', gen_random_uuid())
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, location = EXCLUDED.location;
      `, [id, TENANT_ID, clientId, name, loc, lat, lng]);
    }

    // 5. Insert Operators
    console.log('👷 Seeding operators...');
    const opRows = [
      ['00000000-0000-0000-0003-000000000001', 'Ramesh Kumar', '+91 98451 11223'],
      ['00000000-0000-0000-0003-000000000002', 'Suresh Yadav', '+91 98210 22334'],
      ['00000000-0000-0000-0003-000000000003', 'Abdul Karim', '+91 97420 33445'],
      ['00000000-0000-0000-0003-000000000004', 'Vikram Singh', '+91 99110 44556'],
      ['00000000-0000-0000-0003-000000000005', 'Pradeep Sharma', '+91 98260 55667'],
    ];

    for (const [id, name, phone] of opRows) {
      await client.query(`
        INSERT INTO tenant.operators (id, tenant_id, name, phone, is_active, client_uuid)
        VALUES ($1, $2, $3, $4, true, gen_random_uuid())
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone;
      `, [id, TENANT_ID, name, phone]);
    }

    // 6. Insert Machines
    console.log('🚜 Seeding machines...');
    const machineRows = [
      ['00000000-0000-0000-0004-000000000001', 'EX-01', 'excavator', 'Caterpillar', '320D3', 2023, 'hours', 'Hours', 4280.5, 'active', 'Metro pier excavation'],
      ['00000000-0000-0000-0004-000000000002', 'EX-02', 'excavator', 'Komatsu', 'PC210-10M0', 2023, 'hours', 'Hours', 3950.0, 'active', 'Rock breaking and trenching'],
      ['00000000-0000-0000-0004-000000000003', 'DZ-01', 'dozer', 'Caterpillar', 'D6R', 2022, 'hours', 'Hours', 5620.2, 'active', 'Worli coastal road leveling'],
      ['00000000-0000-0000-0004-000000000004', 'BL-01', 'backhoe_loader', 'JCB', '3DX Super', 2024, 'hours', 'Hours', 1840.4, 'active', 'Airport utility trenching'],
      ['00000000-0000-0000-0004-000000000005', 'WL-01', 'wheel_loader', 'Volvo', 'L120H', 2023, 'hours', 'Hours', 3210.8, 'active', 'Coastal road hopper feeding'],
      ['00000000-0000-0000-0004-000000000006', 'DT-01', 'dump_truck', 'Tata Motors', 'Prima 2830.K', 2023, 'km', 'Km', 48920, 'active', 'Metro muck disposal'],
      ['00000000-0000-0000-0004-000000000007', 'DT-02', 'dump_truck', 'BharatBenz', '2828C', 2023, 'km', 'Km', 52180, 'idle', 'Low fuel reserve warning'],
      ['00000000-0000-0000-0004-000000000008', 'MG-01', 'motor_grader', 'Caterpillar', '140K', 2022, 'hours', 'Hours', 3740.0, 'active', 'NH-44 subgrade grading'],
    ];

    for (const [id, code, type, make, model, year, pType, pUnit, meter, status, note] of machineRows) {
      await client.query(`
        INSERT INTO tenant.machines (id, tenant_id, code, type, make, model, year, primary_meter_type, meter_unit_label, current_meter, status_flag, flag_note, client_uuid)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, gen_random_uuid())
        ON CONFLICT (id) DO UPDATE SET current_meter = EXCLUDED.current_meter, status_flag = EXCLUDED.status_flag;
      `, [id, TENANT_ID, code, type, make, model, year, pType, pUnit, meter, status, note]);
    }

    // 7. Insert Deployments
    console.log('📌 Seeding deployments...');
    const depRows = [
      ['00000000-0000-0000-0005-000000000001', '00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0002-000000000001'],
      ['00000000-0000-0000-0005-000000000002', '00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0002-000000000001'],
      ['00000000-0000-0000-0005-000000000003', '00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0002-000000000002'],
      ['00000000-0000-0000-0005-000000000004', '00000000-0000-0000-0004-000000000004', '00000000-0000-0000-0002-000000000003'],
      ['00000000-0000-0000-0005-000000000005', '00000000-0000-0000-0004-000000000005', '00000000-0000-0000-0002-000000000002'],
      ['00000000-0000-0000-0005-000000000006', '00000000-0000-0000-0004-000000000006', '00000000-0000-0000-0002-000000000001'],
      ['00000000-0000-0000-0005-000000000007', '00000000-0000-0000-0004-000000000007', '00000000-0000-0000-0002-000000000005'],
      ['00000000-0000-0000-0005-000000000008', '00000000-0000-0000-0004-000000000008', '00000000-0000-0000-0002-000000000005'],
    ];

    for (const [id, mchId, siteId] of depRows) {
      await client.query(`
        INSERT INTO tenant.deployments (id, tenant_id, machine_id, site_id, start_date, status, client_uuid)
        VALUES ($1, $2, $3, $4, CURRENT_DATE - INTERVAL '90 days', 'active', gen_random_uuid())
        ON CONFLICT (id) DO NOTHING;
      `, [id, TENANT_ID, mchId, siteId]);
    }

    // 8. Insert Cash Accounts
    console.log('💵 Seeding cash accounts...');
    const cashRows = [
      ['00000000-0000-0000-0006-000000000001', 'Site Cash — Metro Block A', 'site_cash', 'INR'],
      ['00000000-0000-0000-0006-000000000002', 'HDFC Corporate Operating A/c', 'bank', 'INR'],
      ['00000000-0000-0000-0006-000000000003', 'SBI Capex & Fleet Treasury', 'bank', 'INR'],
      ['00000000-0000-0000-0006-000000000004', 'Petty Cash — HQ Workshop', 'petty', 'INR'],
    ];

    for (const [id, name, type, currency] of cashRows) {
      await client.query(`
        INSERT INTO tenant.cash_accounts (id, tenant_id, name, type, currency, client_uuid)
        VALUES ($1, $2, $3, $4, $5, gen_random_uuid())
        ON CONFLICT (id) DO NOTHING;
      `, [id, TENANT_ID, name, type, currency]);
    }

    // 9. Insert Rate Cards
    console.log('💳 Seeding rate cards...');
    const rateRows = [
      ['00000000-0000-0000-0007-000000000001', '00000000-0000-0000-0005-000000000001', 'hourly', 260000, 8],
      ['00000000-0000-0000-0007-000000000002', '00000000-0000-0000-0005-000000000002', 'hourly', 250000, 8],
      ['00000000-0000-0000-0007-000000000003', '00000000-0000-0000-0005-000000000003', 'hourly', 340000, 8],
    ];

    for (const [id, depId, strategy, rateMinor, minUnits] of rateRows) {
      await client.query(`
        INSERT INTO tenant.rate_cards (id, tenant_id, deployment_id, strategy, rate_minor, currency, min_units_per_day, effective_from, client_uuid)
        VALUES ($1, $2, $3, $4, $5, 'INR', $6, CURRENT_DATE - INTERVAL '90 days', gen_random_uuid())
        ON CONFLICT (id) DO NOTHING;
      `, [id, TENANT_ID, depId, strategy, rateMinor, minUnits]);
    }

    console.log('✅ Demo fleet dataset seeded successfully into PostgreSQL!');
  } catch (error) {
    console.error('❌ Demo seed encountered error:', error);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  seedDemo().catch(console.error);
}

module.exports = { seedDemo };
