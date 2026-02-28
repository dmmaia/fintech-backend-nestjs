import { Module } from '@nestjs/common';
import { AccountsModule } from './modules/accounts/accounts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostgresConfigService } from './config/database.config';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LedgerModule } from './modules/ledger/ledger.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: PostgresConfigService,
      inject: [PostgresConfigService],
    }),
    EventEmitterModule.forRoot(),
    AccountsModule,
    TransactionsModule,
    LedgerModule
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
