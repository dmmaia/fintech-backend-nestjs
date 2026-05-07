import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggersService } from './logger.service';

@Module({
  imports: [TypeOrmModule.forFeature([Logger])],
  providers: [LoggersService],
  exports: [LoggersService]
})
export class LoggerModule {}
