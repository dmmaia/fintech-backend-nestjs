import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto, DepositDto } from './transaction.dto';
import { Transaction } from './transaction.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuid } from 'uuid'
import { AccountsService } from '../accounts/accounts.service';
import { EVENTS } from 'src/events/event.constants';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>,
    private eventEmitter: EventEmitter2,
    private accountService: AccountsService
  ){}

  async create(dto: CreateTransactionDto) {
    const newTransaction = new Transaction()
    newTransaction.id = uuid()
    newTransaction.amount = dto.amount
    newTransaction.currency = dto.currency
    newTransaction.status = "PENDING"
    newTransaction.senderAccountId = dto.senderAccountId
    newTransaction.receiverAccountId = dto.receiverAccountId

    await this.transactionRepository.create(newTransaction)
    return newTransaction
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

  async findByAccount(accountId: string): Promise<Transaction[]> {
    const transaction = await this.transactionRepository.find({ where: [{ senderAccountId: accountId }, { receiverAccountId: accountId }] });
    if (!transaction) throw new NotFoundException('No transaction found');
    return transaction
  }

}
