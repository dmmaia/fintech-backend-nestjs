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

  async create(level:string, message: string, metadata: Object, type=Type.request){
     const logger: Logger = new Logger();

    logger.level = level;
    logger.type = type;
    logger.message = message;
    logger.requestId = this.cls.getId();
    logger.userId = this.cls.get("userId")
    logger.metadata = metadata;
    await this.LoggerRepository.save(logger);
  }

  async info(message: string, metadata: Object, type=Type.request) {
    await this.create("info", message, metadata, type)
  }

  async warn(message: string, metadata: Object, type=Type.request) {
    await this.create("warn", message, metadata, type)
  }

  async error(message: string, metadata: Object, type=Type.request) {
    await this.create("error", message, metadata, type)
  }

}
