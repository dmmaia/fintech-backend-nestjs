import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [TransactionsModule],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
