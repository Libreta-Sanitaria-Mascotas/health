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
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Health Records')
@Controller('health-records')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @ApiOperation({ summary: 'Create a new health record' })
  @ApiBody({ type: CreateHealthRecordDto })
  @Post()
  create(@Body() createHealthRecordDto: CreateHealthRecordDto) {
    return this.healthService.create(createHealthRecordDto);
  }

  @ApiOperation({ summary: 'Get all health records' })
  @Get()
  findAll() {
    return this.healthService.findAll();
  }

  @ApiOperation({ summary: 'Get a health record by ID' })
  @ApiParam({ name: 'id', description: 'ID of the health record' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.healthService.findOne(id);
  }

  @ApiOperation({ summary: 'Get health records by pet ID' })
  @ApiParam({ name: 'petId', description: 'ID of the pet' })
  @Get('pet/:petId')
  findByPetId(@Param('petId') petId: string) {
    return this.healthService.findByPetId(petId);
  }

  @ApiOperation({ summary: 'Update a health record by ID' })
  @ApiParam({ name: 'id', description: 'ID of the health record' })
  @ApiBody({ type: UpdateHealthRecordDto })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateHealthRecordDto: UpdateHealthRecordDto,
  ) {
    return this.healthService.update(id, updateHealthRecordDto);
  }

  @ApiOperation({ summary: 'Delete a health record by ID' })
  @ApiParam({ name: 'id', description: 'ID of the health record' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.healthService.remove(id);
  }
}
