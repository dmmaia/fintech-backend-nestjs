import { Injectable, NotFoundException } from '@nestjs/common';
import { Logger } from './logger.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class LoggersService {
  constructor(
    @InjectRepository(Logger) private readonly LoggerRepository: Repository<Logger>
  ){}

  create(createLoggerDto) {
    return this.LoggerRepository.create(createLoggerDto)
  }

}
