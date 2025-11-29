import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  MaxDate,
  MinDate,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

const MAX_FUTURE_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_FUTURE_DATE = new Date(Date.now() + MAX_FUTURE_MS);

const normalizeDate = (value: string) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  const ddMmYyyyMatch = /^(\d{2})[/-](\d{2})[/-](\d{4})$/.exec(trimmed);
  if (ddMmYyyyMatch) {
    const [, dd, mm, yyyy] = ddMmYyyyMatch;
    return `${yyyy}-${mm}-${dd}`;
  }
  return trimmed;
};

const toBoolean = (value: unknown) => {
  if (value === undefined || value === null) return value as any;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    return ['true', '1', 'yes', 'on'].includes(normalized);
  }
  return value;
};

export class CreateHealthRecordDto {

  @ApiProperty({ 
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the pet' })
  @IsUUID()
  petId: string;

  @ApiProperty({ 
    example: 'vaccine',
    description: 'Type of the health record' })
  @IsIn(['vaccine', 'consultation', 'deworming', 'analysis', 'other'])
  type: 'vaccine' | 'consultation' | 'deworming' | 'analysis' | 'other';

  @ApiProperty({ 
    example: '2023-01-01',
    description: 'Date of the health record' })
  @Transform(({ value }) => new Date(normalizeDate(value)))
  @Type(() => Date)
  @IsDate()
  @MaxDate(MAX_FUTURE_DATE, { message: 'La fecha no puede ser más de 7 días en el futuro' })
  date: Date;

  @ApiProperty({ 
    example: 'Vaccination for Rabies',
    description: 'Title of the health record' })
  @IsString()
  title: string;

  @ApiProperty({ 
    example: 'Rabies vaccination for the pet',
    description: 'Description of the health record' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    example: 'Dr. J. Doe',
    description: 'Doctor of the health record' })
  @IsString()
  @IsOptional()
  doctor?: string;

  @ApiProperty({ 
    example: 'Clinic of the health record',
    description: 'Clinic of the health record' })
  @IsString()
  @IsOptional()
  clinic?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica si hay una próxima visita agendada'
  })
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  hasNextVisit?: boolean;

  @ApiPropertyOptional({
    example: '2023-01-15',
    description: 'Fecha de la próxima visita si corresponde'
  })
  @Transform(({ value }) => value ? new Date(normalizeDate(value)) : value)
  @Type(() => Date)
  @ValidateIf((record) => record.hasNextVisit === true)
  @IsDate()
  @MinDate(new Date(), { message: 'La próxima visita debe ser en el futuro' })
  nextVisitDate?: Date;

  @ApiProperty({ 
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    description: 'Media IDs of the health record' })
  @IsArray()
  @IsOptional()
  @IsUUID('all', { each: true })
  mediaIds?: string[];

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174111',
    description: 'OwnerId used only for authorization (not persisted)'
  })
  @IsUUID()
  @IsOptional()
  ownerId?: string;
}
