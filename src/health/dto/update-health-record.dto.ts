import { PartialType } from '@nestjs/swagger';
import { CreateHealthRecordDto } from './create-health-record.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateHealthRecordDto extends PartialType(CreateHealthRecordDto) {
  @IsUUID()
  @IsOptional()
  id?: string;
}
