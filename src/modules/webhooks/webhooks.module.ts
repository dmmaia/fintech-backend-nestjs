import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { TransactionsModule } from '../transactions/transactions.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [
    TransactionsModule,
    LoggerModule
  ],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
