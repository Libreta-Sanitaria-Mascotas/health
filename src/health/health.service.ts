import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthRecord } from './entities/health.entity';
import { RpcException, ClientProxy } from '@nestjs/microservices';
import { CreateHealthRecordDto } from './dto/create-health-record.dto';
import { UpdateHealthRecordDto } from './dto/update-health-record.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HealthService {
  constructor(
    @InjectRepository(HealthRecord)
    private readonly healthRecordRepository: Repository<HealthRecord>,
    @Inject('PET_SERVICE') private readonly petClient: ClientProxy,
  ) {}

  async create(createHealthRecordDto: CreateHealthRecordDto) {
    try {
      if (!createHealthRecordDto.petId) {
        throw new RpcException({
          statusCode: 400,
          message: 'El ID de la mascota es obligatorio',
        });
      }

      // Validar que la mascota existe
      const petValidation = await firstValueFrom(
        this.petClient.send({ cmd: 'validate_pet' }, { id: createHealthRecordDto.petId })
      );

      if (!petValidation || !petValidation.exists) {
        throw new RpcException({
          statusCode: 404,
          message: `La mascota con ID ${createHealthRecordDto.petId} no existe`,
        });
      }

      const healthRecord = this.healthRecordRepository.create(
        createHealthRecordDto,
      );
      return await this.healthRecordRepository.save(healthRecord);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        statusCode: 500,
        message: 'No se pudo crear el registro de salud',
      });
    }
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

  /**
   * Vincula un archivo de media a un registro de salud
   */
  async linkMedia(healthRecordId: string, mediaId: string) {
    const record = await this.healthRecordRepository.findOne({
      where: { id: healthRecordId },
    });

    if (!record) {
      throw new RpcException({
        statusCode: 404,
        message: 'Registro de salud no encontrado',
      });
    }

    const currentMediaIds = record.mediaIds || [];
    if (!currentMediaIds.includes(mediaId)) {
      record.mediaIds = [...currentMediaIds, mediaId];
      await this.healthRecordRepository.save(record);
    }
    return record;
  }

  /**
   * Elimina la vinculación de un archivo de media
   */
  async unlinkMedia(healthRecordId: string, mediaId: string) {
    const record = await this.healthRecordRepository.findOne({
      where: { id: healthRecordId },
    });

    if (!record) {
      throw new RpcException({
        statusCode: 404,
        message: 'Registro de salud no encontrado',
      });
    }

    record.mediaIds = (record.mediaIds || []).filter(id => id !== mediaId);
    await this.healthRecordRepository.save(record);
    return record;
  }
}
