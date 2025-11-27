import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';
import { envs } from './config';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

@Module({
  imports: [HealthModule, TypeOrmModule.forRootAsync({
    useFactory:async () => {
      const { db, nodeEnv } = envs
      return{
        ...db,
        entities: [__dirname + '/**/entities/*.entity{.ts,.js}'],
        synchronize: nodeEnv === 'development',
      };
    }
  })],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
