import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';

@Injectable()
export class MachinesRepository {
  constructor(private db: DatabaseService) {}

  private unpackRow(row: any) {
    if (!row) return row;
    try {
      const attrs = typeof row.attributes === 'string'
        ? JSON.parse(row.attributes)
        : (typeof row.attributes === 'object' && row.attributes !== null ? row.attributes : {});
      return { ...attrs, ...row };
    } catch {
      return row;
    }
  }

  async findAll(tenantId: string) {
    const result = await this.db.queryWithTenant(tenantId, 'owner',
      `SELECT * FROM tenant.machines ORDER BY code`,
    );
    return result.rows.map((r) => this.unpackRow(r));
  }

  async findById(tenantId: string, id: string) {
    const result = await this.db.queryWithTenant(tenantId, 'owner',
      `SELECT * FROM tenant.machines WHERE id = $1`,
      [id],
    );
    return this.unpackRow(result.rows[0]);
  }

  async create(tenantId: string, data: Record<string, unknown>, clientUuid: string) {
    const rawAttrs = typeof data.attributes === 'object' && data.attributes !== null
      ? (data.attributes as Record<string, unknown>)
      : {};
    const attributes = {
      ...rawAttrs,
      hourly_rate: data.hourly_rate,
      fuel_capacity_litres: data.fuel_capacity_litres,
      fuel_level_pct: data.fuel_level_pct,
      site_id: data.site_id,
      site_name: data.site_name,
      client_id: data.client_id,
      client_name: data.client_name,
      operator_id: data.operator_id,
      operator_name: data.operator_name,
    };

    const currentMeter = typeof data.current_meter === 'number' ? data.current_meter : 0;

    const result = await this.db.queryWithTenant(tenantId, 'owner',
      `INSERT INTO tenant.machines (tenant_id, code, type, make, model, year, chassis_no,
        primary_meter_type, meter_unit_label, current_meter, status_flag, attributes, client_uuid)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (tenant_id, client_uuid) DO NOTHING
       RETURNING *`,
      [
        tenantId, data.code, data.type, data.make, data.model, data.year,
        data.chassis_no, data.primary_meter_type, data.meter_unit_label,
        currentMeter, data.status_flag || 'active', JSON.stringify(attributes), clientUuid,
      ],
    );
    if (result.rows.length === 0) {
      return this.findById(tenantId, clientUuid);
    }
    return this.unpackRow(result.rows[0]);
  }

  async updateMeter(tenantId: string, id: string, meter: number) {
    const result = await this.db.queryWithTenant(tenantId, 'owner',
      `UPDATE tenant.machines SET current_meter = $2 WHERE id = $1 RETURNING *`,
      [id, meter],
    );
    return this.unpackRow(result.rows[0]);
  }
}
