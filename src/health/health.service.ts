import { Injectable } from '@nestjs/common';
import { CreateHealthRecordDto } from './dto/create-health-record.dto';
import { UpdateHealthRecordDto } from './dto/update-health-record.dto';

@Injectable()
export class HealthService {
  create(createHealthRecordDto: CreateHealthRecordDto) {
    return 'This action adds a new health record';
  }

  findAll() {
    return `This action returns all health records`;
  }

  findOne(id: number) {
    return `This action returns a #${id} health record`;
  }

  update(id: number, updateHealthRecordDto: UpdateHealthRecordDto) {
    return `This action updates a #${id} health record`;
  }

  remove(id: number) {
    return `This action removes a #${id} health record`;
  }
}
