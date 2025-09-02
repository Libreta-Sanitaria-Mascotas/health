import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthRecord } from './entities/health.entity';
import { RpcException } from '@nestjs/microservices';
import { CreateHealthRecordDto } from './dto/create-health-record.dto';
import { UpdateHealthRecordDto } from './dto/update-health-record.dto';

@Injectable()
export class HealthService {
  constructor(
    @InjectRepository(HealthRecord)
    private readonly healthRecordRepository: Repository<HealthRecord>,
  ) {}

  async create(createHealthRecordDto: CreateHealthRecordDto) {
    const healthRecord = this.healthRecordRepository.create(
      createHealthRecordDto,
    );
    return await this.healthRecordRepository.save(healthRecord);
  }

  async findAll() {
    return await this.healthRecordRepository.find();
  }

  async findByPetId(petId: string) {
    return await this.healthRecordRepository.find({
      where: {
        petId,
      },
    });
  }

  async findOne(id: string) {
    const healthRecord = await this.healthRecordRepository.findOne({
      where: {
        id,
      },
    });
    if (!healthRecord) {
      throw new NotFoundException('Health record not found');
    }
    return healthRecord;
  }

  async update(updateHealthRecordDto: UpdateHealthRecordDto) {
    try {
      const { id } = updateHealthRecordDto;
      if (!id) throw new BadRequestException('Id health record is required');
      const healthRecord = await this.findOne(id);
      return await this.healthRecordRepository.save({
        ...healthRecord,
        ...updateHealthRecordDto,
      });
    } catch (error) {
      throw error instanceof BadRequestException
        ? new RpcException({
            statusCode: error.getStatus(),
            message: error.message,
          })
        : new RpcException({
            statusCode: 500,
            message: 'Not able to update health record',
          });
    }
  }

  async remove(id: string) {
    const healthRecord = await this.findOne(id);
    return await this.healthRecordRepository.remove(healthRecord);
  }
}
