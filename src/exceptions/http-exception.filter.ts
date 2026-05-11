
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { Type } from 'src/logger/logger.entity';
import { LoggersService } from 'src/logger/logger.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    constructor(
        private loggersService: LoggersService
    ){}
    
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const status = exception.getStatus();

    this.loggersService.error(
        "Unhandled exception",
        {
            path: req.url,
            method: req.method,
            statusCode: res.statusCode,
            error: exception.message,
            stack: exception.stack,
        },
        Type.error
    );

    res
      .status(status)
      .json({
        message: exception.message,
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: req.url,
      });
  }
}
