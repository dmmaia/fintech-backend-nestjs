import { Injectable, NotFoundException } from '@nestjs/common';
import { Logger, Type } from './logger.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class LoggersService {
  constructor(
    @InjectRepository(Logger) private readonly LoggerRepository: Repository<Logger>,
    private readonly cls: ClsService
  ){}

  create(level:string, message: string, metadata: Object, type=Type.request){
     const logger: Logger = new Logger();

    logger.level = level;
    logger.type = type;
    logger.message = message;
    logger.requestId = this.cls.getId();
    logger.userId = this.cls.get("userId")
    logger.metadata = metadata;
    this.LoggerRepository.save(logger);
  }

  info(message: string, metadata: Object, type=Type.request) {
    this.create("info", message, metadata, type)
  }

  warn(message: string, metadata: Object, type=Type.request) {
    this.create("warn", message, metadata, type)
  }

  error(message: string, metadata: Object, type=Type.request) {
    this.create("error", message, metadata, type)
  }

}
