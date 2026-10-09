import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMachineDto {
  @ApiProperty({ example: 'EXC-001' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'excavator' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiPropertyOptional({ example: 'Caterpillar' })
  @IsString()
  @IsOptional()
  make?: string;

  @ApiPropertyOptional({ example: '320F' })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiPropertyOptional({ example: 2020 })
  @IsNumber()
  @IsOptional()
  year?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  chassis_no?: string;

  @ApiProperty({ example: 'hours' })
  @IsString()
  @IsNotEmpty()
  primary_meter_type: string;

  @ApiProperty({ example: 'hours' })
  @IsString()
  @IsNotEmpty()
  meter_unit_label: string;

  @ApiProperty()
  @IsUUID()
  client_uuid: string;

  @ApiPropertyOptional({ example: 0, description: 'Initial / current meter reading' })
  @IsNumber()
  @IsOptional()
  current_meter?: number;

  @ApiPropertyOptional({ example: 'active', description: 'active | idle | service' })
  @IsString()
  @IsOptional()
  status_flag?: string;

  @ApiPropertyOptional({ example: 2000, description: 'Hourly billing rate in currency units' })
  @IsNumber()
  @IsOptional()
  hourly_rate?: number;

  @ApiPropertyOptional({ example: 300, description: 'Fuel tank capacity in litres' })
  @IsNumber()
  @IsOptional()
  fuel_capacity_litres?: number;

  @ApiPropertyOptional({ example: 80, description: 'Current fuel tank level percentage' })
  @IsNumber()
  @IsOptional()
  fuel_level_pct?: number;

  @ApiPropertyOptional({ example: 'site-1' })
  @IsString()
  @IsOptional()
  site_id?: string;

  @ApiPropertyOptional({ example: 'Bangalore Metro Phase 2 — Reach 6' })
  @IsString()
  @IsOptional()
  site_name?: string;

  @ApiPropertyOptional({ example: 'cli-1' })
  @IsString()
  @IsOptional()
  client_id?: string;

  @ApiPropertyOptional({ example: 'L&T Construction' })
  @IsString()
  @IsOptional()
  client_name?: string;

  @ApiPropertyOptional({ example: 'op-1' })
  @IsString()
  @IsOptional()
  operator_id?: string;

  @ApiPropertyOptional({ example: 'Assigned Operator' })
  @IsString()
  @IsOptional()
  operator_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  attributes?: Record<string, unknown>;
}
