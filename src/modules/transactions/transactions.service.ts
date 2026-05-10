import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto, DepositDto } from './transaction.dto';
import { Transaction, OrderStatus } from './transaction.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuid } from 'uuid'
import { AccountsService } from '../accounts/accounts.service';
import { EVENTS } from 'src/events/event.constants';
import { Account } from '../accounts/account.entity';
import { LedgerEntry, LedgerCategory, LedgerType } from '../ledger/ledger.entity';
import { LoggersService } from 'src/logger/logger.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>,
    private eventEmitter: EventEmitter2,
    private accountService: AccountsService,
    private loggersService: LoggersService,
    private dataSource: DataSource,
  ){}

  async create(dto: CreateTransactionDto) {
    const account = await this.accountService.findOne(dto.senderAccountId)

    if(account.balance - account.reservedBalance<dto.amount){
      this.loggersService.warn("Insufficient funds", {
        "path": "transactions/transfer",
        "method": "POST",
      });
      throw new Error("Insufficient funds")
    }

    this.loggersService.info("Validating balance", {
      "path": "transactions/transfer",
      "method": "POST",
    });

    this.loggersService.info("Validating if already exists", {
      "path": "transactions/transfer",
      "method": "POST",
    });
    const existing = await this.transactionRepository.findOneBy({ providerTransactionId:dto.providerTransactionId })
    if (existing) return existing;

    return await this.dataSource.transaction(async (manager)=> {
      const transactionObject = {
        id: uuid(),
        amount: dto.amount,
        status: OrderStatus.PENDING,
        senderAccountId: dto.senderAccountId,
        providerTransactionId: dto.providerTransactionId,
        receiverAccountId: dto.receiverAccountId
      }
      const newTransaction = await manager.insert(Transaction,transactionObject)

      this.loggersService.info("Transaction created", {
        "path": "transactions/transfer",
        "method": "POST",
      });
      
      await manager.insert(LedgerEntry, {
          accountId: dto.senderAccountId,
          amount: -dto.amount,
          type: LedgerType.DEBIT,
          category: LedgerCategory.RESERVE,
          transactionId: transactionObject.id
        })

      this.loggersService.info("Reserve balance Ledger entry created", {
        "path": "transactions/transfer",
        "method": "POST",
      });

      await manager.findOne(Account, {
        where: { id: dto.senderAccountId },
        lock: { mode: 'pessimistic_write' }
      });
      await manager.increment(Account, {id:dto.senderAccountId}, 'reservedBalance', dto.amount)
      
      this.loggersService.info("Balance reserved", {
        "path": "transactions/transfer",
        "method": "POST",
      });

      this.eventEmitter.emit(EVENTS.TRANSACTION_CREATED, {
          ...newTransaction
        });
    
      return newTransaction
    })
  }

  async changeStatus(id, status) {
    await this.transactionRepository.update(id, {status})
  }

  async deposit(dto:DepositDto){
    const account = await this.accountService.findOne(dto.accountId)
    if(!account) throw new NotFoundException('Account not found')

    this.eventEmitter.emit(EVENTS.DEPOSIT_REQUESTED, {
        eventId: uuid(),
        accountId: account.id,
        amount: dto.amount
      });
  }

  async withdraw(dto:DepositDto){
    const account = await this.accountService.findOne(dto.accountId)
    if(!account) throw new NotFoundException('Account not found')

    this.eventEmitter.emit(EVENTS.WITHDRAW_REQUESTED, {
        eventId: uuid(),
        accountId: account.id,
        amount: dto.amount
      });
  }

  async findOne(id: string) {
    const transaction = await this.transactionRepository.findOneBy({id})
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction
  }

  async findOneByProvider(id: string) {
    const transaction = await this.transactionRepository.findOneBy({
      providerTransactionId:id,
    })
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction
  }

  async findByAccount(accountId: string): Promise<Transaction[]> {
    const transaction = await this.transactionRepository.find({ where: [{ senderAccountId: accountId }, { receiverAccountId: accountId }] });
    if (!transaction) throw new NotFoundException('No transaction found');
    return transaction
  }

}
