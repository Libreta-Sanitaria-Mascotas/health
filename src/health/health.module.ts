import { Module } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthRecord } from './entities/health.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports:[
    TypeOrmModule.forFeature([HealthRecord]),
    ClientsModule.register([
      {
        name: 'PET_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin123@rabbitmq:5672'],
          queue: 'pet_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
