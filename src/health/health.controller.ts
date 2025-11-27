import {
  Controller,
  //Get,
  //Post,
  //Body,
  //Patch,
  //Param,
  //Delete,
} from '@nestjs/common';
//import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Payload, MessagePattern } from '@nestjs/microservices';
import { HealthService } from './health.service';
import { CreateHealthRecordDto } from './dto/create-health-record.dto';
import { UpdateHealthRecordDto } from './dto/update-health-record.dto';

//@ApiTags('Health Records')
@Controller('health-records')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  //@ApiOperation({ summary: 'Create a new health record' })
  //@ApiBody({ type: CreateHealthRecordDto })
  //@Post()
  @MessagePattern({ cmd: 'create_health_record' })
  create(@Payload() createHealthRecordDto: CreateHealthRecordDto) {
    return this.healthService.create(createHealthRecordDto);
  }

  //@ApiOperation({ summary: 'Get all health records' })
  //@Get()
  @MessagePattern({ cmd: 'find_all_health_records' })
  findAll() {
    return this.healthService.findAll();
  }

  //@ApiOperation({ summary: 'Get a health record by ID' })
  //@ApiParam({ name: 'id', description: 'ID of the health record' })
  //@Get(':id')
  @MessagePattern({ cmd: 'find_health_record_by_id' })
  findOne(@Payload('id') id: string) {
    return this.healthService.findOne(id);
  }

  //@ApiOperation({ summary: 'Get health records by pet ID' })
  //@ApiParam({ name: 'petId', description: 'ID of the pet' })
  //@Get('pet/:petId')
  @MessagePattern({ cmd: 'find_all_health_records_by_pet_id' })
  findByPetId(@Payload('petId') petId: string) {
    return this.healthService.findByPetId(petId);
  }

  //@ApiOperation({ summary: 'Update a health record by ID' })
  //@ApiParam({ name: 'id', description: 'ID of the health record' })
  //@ApiBody({ type: UpdateHealthRecordDto })
  //@Patch(':id')
  @MessagePattern({ cmd: 'update_health_record_by_id' })
  update(@Payload() updateHealthRecordDto: UpdateHealthRecordDto) {
    return this.healthService.update(updateHealthRecordDto);
  }

  //@ApiOperation({ summary: 'Delete a health record by ID' })
  //@ApiParam({ name: 'id', description: 'ID of the health record' })
  //@Delete(':id')
  @MessagePattern({ cmd: 'delete_health_record_by_id' })
  remove(@Payload() data: { id: string; ownerId?: string }) {
    return this.healthService.remove(data.id, data.ownerId);
  }

  @MessagePattern({ cmd: 'link_media' })
  async linkMedia(@Payload() data: { healthRecordId: string; mediaId: string }) {
    return await this.healthService.linkMedia(data.healthRecordId, data.mediaId);
  }

  @MessagePattern({ cmd: 'unlink_media' })
  async unlinkMedia(@Payload() data: { healthRecordId: string; mediaId: string }) {
    return await this.healthService.unlinkMedia(data.healthRecordId, data.mediaId);
  }
}
