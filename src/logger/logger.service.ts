import { Injectable, NotFoundException } from '@nestjs/common';
import { Logger, Type } from './logger.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class LoggersService {
  constructor(
    @InjectRepository(Logger) private readonly LoggerRepository: Repository<Logger>
  ){}

  create(level:string, requestId:string, message: string, metadata: JSON, type=Type.request){
     const logger: Logger = new Logger();

    logger.level = level;
    logger.type = type;
    logger.message = message;
    logger.requestId = requestId;
    logger.metadata = metadata;
    this.LoggerRepository.save(logger);
  }

  info(message: string, requestId:string, metadata: JSON) {
    this.create("info", requestId, message, metadata)
  }

  warn(message: string, requestId:string, metadata: JSON) {
    this.create("warn", requestId, message, metadata)
  }

  error(message: string, requestId:string, metadata: JSON) {
    this.create("error", requestId, message, metadata)
  }

}
