import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { EVENTS } from "./event.constants";
import * as eventTypes from "./event.types";
import { LedgerService } from "src/modules/ledger/ledger.service";
import { AccountsService } from "src/modules/accounts/accounts.service";
import { QueryFailedError } from "typeorm";

@Injectable()
export class EventConsumer {
  constructor(private ledgerService: LedgerService) {}

    @OnEvent(EVENTS.DEPOSIT_REQUESTED)
    async handleDeposit(event: eventTypes.DepositRequestedEvent) {
        await this.ledgerService.create({
        accountId: event.accountId,
        amount: event.amount,
        type: 'CREDIT',
        transactionId: event.eventId
        })
    }

    @OnEvent(EVENTS.WITHDRAW_REQUESTED)
    async handleWithdraw(event: eventTypes.DepositRequestedEvent) {
        await this.ledgerService.create({
        accountId: event.accountId,
        amount: event.amount,
        type: 'DEBIT',
        transactionId: event.eventId
        })
    }

    @OnEvent(EVENTS.TRANSACTION_COMPLETED)
    async handleTransaction(event: eventTypes.TransactionCompletedEvent) {
        try {
            await this.ledgerService.postDoubleEntry({
            transactionId:event.id,
            amount: event.amount,
            receiverId: event.receiverAccountId,
            senderId: event.senderAccountId
        })
        } catch (error) {
            if(error instanceof QueryFailedError && error.driverError.code === '23505')
                return;
            throw error
        }
    }

    @OnEvent(EVENTS.TRANSACTION_COMPLETED)
    async handleTransactionConcurrencySafety(event: eventTypes.TransactionCompletedEvent) {
        await this.handleTransaction(event)
    }

    @OnEvent(EVENTS.TRANSACTION_FAILED)
    async handleTransactionFailed(event: eventTypes.TransactionCompletedEvent){
        await this.ledgerService.failedTransaction({
            transactionId: event.id,
            senderId: event.senderAccountId,
            amount: event.amount
        })
    }

    @OnEvent(EVENTS.TRANSACTION_CREATED)
    async handleTransactionCreated(event: eventTypes.TransactionCompletedEvent){
        //Will create a cron to handle timeout and change to failed
    }
}