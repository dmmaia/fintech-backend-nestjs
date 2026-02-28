import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { EVENTS } from "./event.constants";
import * as eventTypes from "./event.types";
import { LedgerService } from "src/modules/ledger/ledger.service";

@Injectable()
export class EventConsumer {
  constructor(private ledgerService: LedgerService) {}

    @OnEvent(EVENTS.DEPOSIT_REQUESTED)
    async handleDeposit(event: eventTypes.DepositRequestedEvent) {
        await this.ledgerService.create({
        accountId: event.accountId,
        amount: event.amount,
        type: 'credit',
        transactionId: event.eventId
        })
    }

    @OnEvent(EVENTS.WITHDRAW_REQUESTED)
    async handleWithdraw(event: eventTypes.DepositRequestedEvent) {
        await this.ledgerService.create({
        accountId: event.accountId,
        amount: event.amount,
        type: 'debt',
        transactionId: event.eventId
        })
    }
}