import {
  Controller,
  Body,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { ProviderWebhookDto } from './webhooks.dto';
import { TransactionsService } from '../transactions/transactions.service';
import { ApiBody, ApiHeader, ApiOperation } from '@nestjs/swagger';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENTS } from 'src/events/event.constants';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly transactionsService: TransactionsService,
  private eventEmitter: EventEmitter2,) {
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

    if(payload.status === "succeeded"){
      this.eventEmitter.emit(EVENTS.TRANSACTION_COMPLETED, {
          ...tx
        });
    }else{
      this.eventEmitter.emit(EVENTS.TRANSACTION_FAILED, {
          ...tx
        });
    }
  }
}
