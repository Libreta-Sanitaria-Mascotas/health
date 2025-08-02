import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { HealthService } from './health.service';
import { CreateHealthRecordDto } from './dto/create-health-record.dto';
import { UpdateHealthRecordDto } from './dto/update-health-record.dto';

@Controller('health-records')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Post()
  create(@Body() createHealthRecordDto: CreateHealthRecordDto) {
    return this.healthService.create(createHealthRecordDto);
  }

  @Get()
  findAll() {
    return this.healthService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.healthService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateHealthRecordDto: UpdateHealthRecordDto,
  ) {
    return this.healthService.update(+id, updateHealthRecordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.healthService.remove(+id);
  }
}
