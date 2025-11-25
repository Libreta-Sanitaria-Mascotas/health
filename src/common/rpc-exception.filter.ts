import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, _host: ArgumentsHost) {
    if (exception instanceof RpcException) {
      throw exception;
    }

    if (exception instanceof HttpException) {
      throw new RpcException({
        statusCode: exception.getStatus(),
        message: exception.message,
      });
    }

    const message = exception instanceof Error ? exception.message : 'Internal server error';
    throw new RpcException({
      statusCode: 500,
      message,
    });
  }
}
