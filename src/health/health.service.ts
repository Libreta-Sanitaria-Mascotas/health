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

  /**
   * Crea un registro de salud validando que la mascota exista.
   */
  async create(createHealthRecordDto: CreateHealthRecordDto) {
    try {
      if (!createHealthRecordDto.petId) {
        throw new RpcException({
          statusCode: 400,
          message: 'El ID de la mascota es obligatorio',
        });
      }
      if (!createHealthRecordDto.ownerId) {
        throw new RpcException({
          statusCode: 400,
          message: 'El ID del propietario es obligatorio',
        });
      }

      // Validar que la mascota existe y pertenece al ownerId
      const pet = await firstValueFrom(
        this.petClient.send({ cmd: 'find_pet' }, createHealthRecordDto.petId)
      );

      if (!pet) {
        throw new RpcException({
          statusCode: 404,
          message: `La mascota con ID ${createHealthRecordDto.petId} no existe`,
        });
      }

      if (pet.ownerId !== createHealthRecordDto.ownerId) {
        throw new RpcException({
          statusCode: 403,
          message: 'No está autorizado para crear registros de esta mascota',
        });
      }

      const { ownerId, ...data } = createHealthRecordDto;
      const healthRecord = this.healthRecordRepository.create(
        data,
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

  /** Devuelve todos los registros (uso interno). */
  async findAll() {
    return await this.healthRecordRepository.find();
  }

  /** Obtiene registros por mascota. */
  async findByPetId(petId: string) {
    return await this.healthRecordRepository.find({
      where: {
        petId,
      },
    });
  }

  /** Busca un registro de salud por ID. */
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

  /**
   * Actualiza registro impidiendo cambiar petId.
   */
  async update(updateHealthRecordDto: UpdateHealthRecordDto) {
    try {
      const { id } = updateHealthRecordDto;
      if (!id) throw new BadRequestException('Id health record is required');
      if (!updateHealthRecordDto.ownerId) {
        throw new BadRequestException('Owner id is required');
      }
      const healthRecord = await this.findOne(id);
      if (updateHealthRecordDto.petId && updateHealthRecordDto.petId !== healthRecord.petId) {
        throw new BadRequestException('No está permitido cambiar la mascota asociada');
      }

      const pet = await firstValueFrom(
        this.petClient.send({ cmd: 'find_pet' }, healthRecord.petId)
      );

      if (!pet) {
        throw new RpcException({
          statusCode: 404,
          message: 'La mascota asociada al registro no existe',
        });
      }

      if (pet.ownerId !== updateHealthRecordDto.ownerId) {
        throw new RpcException({
          statusCode: 403,
          message: 'No está autorizado para modificar este registro',
        });
      }

      const { ownerId, ...payload } = updateHealthRecordDto;
      return await this.healthRecordRepository.save({
        ...healthRecord,
        ...payload,
      });
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw new RpcException({
          statusCode: error.getStatus(),
          message: error.message,
        });
      }
      throw new RpcException({
        statusCode: 500,
        message: 'Not able to update health record',
      });
    }
  }

  /** Elimina un registro por ID. */
  async remove(id: string, ownerId?: string) {
    if (!ownerId) {
      throw new RpcException({
        statusCode: 400,
        message: 'Owner id is required',
      });
    }
    const healthRecord = await this.findOne(id);
    const pet = await firstValueFrom(
      this.petClient.send({ cmd: 'find_pet' }, healthRecord.petId)
    );
    if (!pet) {
      throw new RpcException({
        statusCode: 404,
        message: 'La mascota asociada al registro no existe',
      });
    }
    if (pet.ownerId !== ownerId) {
      throw new RpcException({
        statusCode: 403,
        message: 'No está autorizado para eliminar este registro',
      });
    }
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
