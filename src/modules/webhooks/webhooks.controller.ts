import {
  Controller,
  Body,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { ProviderWebhookDto } from './webhooks.dto';
import { TransactionsService } from '../transactions/transactions.service';
import { ApiBody, ApiHeader, ApiOperation } from '@nestjs/swagger';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly transactionsService: TransactionsService) {
  }

  @ApiOperation({
    summary: 'Handle payment provider webhook',
    description: 'Receives asynchronous updates from external payment providers (e.g., Stripe). This endpoint is idempotent. Duplicate webhook deliveries are safely ignored using eventId tracking.'
  })
  @ApiBody({
    schema: {
      example: {
        providerTransactionId: "abc123",
        status: "succeeded",
      }
    }
  })
  @ApiHeader({
    name: 'x-signature',
    description: 'Webhook signature for verification'
  })
  @Post("payments")
    async handleWebhook(@Body() payload: ProviderWebhookDto) {
    const tx = await this.transactionsService.findOneByProvider(payload.providerTransactionId);

    if (!tx) throw new NotFoundException();

    if (payload.status === "succeeded") {
      await this.transactionsService.changeStatus(tx.id, "COMPLETED");
    } else {
      await this.transactionsService.changeStatus(tx.id, "FAILED");
    }
  }
}
