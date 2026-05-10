import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { EVENTS } from "./event.constants";
import * as eventTypes from "./event.types";
import { LedgerService } from "src/modules/ledger/ledger.service";
import { Cron } from '@nestjs/schedule';
import { QueryFailedError } from "typeorm";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import { TransactionsService } from "src/modules/transactions/transactions.service";
import { LedgerType, LedgerCategory } from "src/modules/ledger/ledger.entity";
import { LoggersService } from "src/logger/logger.service";
import { Type } from "src/logger/logger.entity";

@Injectable()
export class EventConsumer {
  constructor(
    private ledgerService: LedgerService,
    private transactionsService: TransactionsService,
    private loggersService: LoggersService,) {}

    @OnEvent(EVENTS.DEPOSIT_REQUESTED)
    async handleDeposit(event: eventTypes.DepositRequestedEvent) {
        this.loggersService.info("Deposit request event emmited", {
            "event": "deposit_created",
            "status": "created"
        }, Type.event);
        await this.ledgerService.create({
            accountId: event.accountId,
            amount: event.amount,
            type: LedgerType.CREDIT,
            category: LedgerCategory.SETTLEMENT,
            transactionId: event.eventId
        })
    }

    @OnEvent(EVENTS.WITHDRAW_REQUESTED)
    async handleWithdraw(event: eventTypes.DepositRequestedEvent) {
        try {
            this.loggersService.info("Withdraw request event emmited", {
                "event": "withdraw_created",
                "status": "created"
            }, Type.event);
            await this.ledgerService.create({
                accountId: event.accountId,
                amount: event.amount,
                type: LedgerType.DEBIT,
                category: LedgerCategory.SETTLEMENT,
                transactionId: event.eventId
            })
        } catch (error) {
            if(error instanceof QueryFailedError && error.driverError.code === '23505')
                return;
            await this.handleTransactionFailed(event);
            throw error
        }
    }

    @OnEvent(EVENTS.TRANSACTION_COMPLETED)
    async handleTransaction(event: eventTypes.TransactionCompletedEvent) {
        try {
            this.loggersService.info("Transaction completed event emmited", {
                "event": "transaction_created",
                "status": "processed"
            }, Type.event);

            await this.ledgerService.postDoubleEntry({
                transactionId:event.id,
                amount: event.amount,
                receiverId: event.receiverAccountId,
                senderId: event.senderAccountId
            })
        } catch (error) {
            if(error instanceof QueryFailedError && error.driverError.code === '23505')
                return;
            await this.handleTransactionFailed({
                eventId:event.id,
                accountId: event.senderAccountId,
                amount: event.amount
            });
            throw error
        }
    }
    
    @OnEvent(EVENTS.TRANSACTION_FAILED)
    async handleTransactionFailed(event: eventTypes.FailedRequestedEvent){
        this.loggersService.warn("Transaction creation failed event emmited", {
            "event": "transaction_created",
            "status": "failed"
        }, Type.event);

        await this.ledgerService.failedTransaction({
            transactionId: event.eventId,
            senderId: event.accountId,
            amount: event.amount
        })
    }

    @OnEvent(EVENTS.TRANSACTION_CREATED)
    async handleTransactionCreated(id:string){
        this.loggersService.info("Transaction creation event emmited", {
            "event": "transaction_created",
            "status": "created"
        }, Type.event);

        const transaction = await this.transactionsService.findOne(id);
        setTimeout(async () => {
            await this.handleTransactionFailed({
                eventId:transaction.id,
                accountId: transaction.senderAccountId,
                amount: transaction.amount
            });
        }, 3600000);
    }
}