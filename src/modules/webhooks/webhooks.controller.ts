import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { ProviderWebhookDto } from './webhooks.dto';
import { TransactionsService } from '../transactions/transactions.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly transactionsService: TransactionsService) {
  }

  @Get("payments")
    async handleWebhook(payload: ProviderWebhookDto) {
    const tx = await this.transactionsService.findOne(payload.providerTransactionId);

    if (!tx) throw new NotFoundException();

    if (payload.status === "succeeded") {
      await this.transactionsService.changeStatus(tx.id, "COMPLETED");
    } else {
      await this.transactionsService.changeStatus(tx.id, "FAILED");
    }
  }
}
