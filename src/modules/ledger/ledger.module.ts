import { Module } from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { LedgerController } from './ledger.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LedgerEntry } from './ledger.entity';
import { TransactionsModule } from '../transactions/transactions.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LedgerEntry]),
    TransactionsModule,
    LoggerModule
  ],
  controllers: [LedgerController],
  providers: [LedgerService],
  exports: [LedgerService]
})
export class LedgerModule {}
