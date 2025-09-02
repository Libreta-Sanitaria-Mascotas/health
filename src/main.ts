import { Logger, ValidationPipe } from '@nestjs/common';
//import { NestFactory } from '@nestjs/core';
//import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { envs } from './config';

async function bootstrap() {
  const logger = new Logger('Health-Service');
  const { port, nodeEnv } = envs;
  //const app = await NestFactory.create(AppModule);
  // app.setGlobalPrefix('api');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: port,
      },
    },
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  // const config = new DocumentBuilder()
  //   .setTitle('Health Service')
  //   .setDescription('Health Service API')
  //   .setVersion('1.0')
  //   //.addBearerAuth()
  //   .build();
  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('docs', app, document);
  await app.listen();
  logger.log(`Health Service is running on: ${port} in ${nodeEnv} mode`);
}
bootstrap();
