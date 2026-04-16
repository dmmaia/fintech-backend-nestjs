import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto, DepositDto } from './transaction.dto';
import { Transaction } from './transaction.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuid } from 'uuid'
import { AccountsService } from '../accounts/accounts.service';
import { EVENTS } from 'src/events/event.constants';
import { Account } from '../accounts/account.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>,
    private eventEmitter: EventEmitter2,
    private accountService: AccountsService,
    private dataSource: DataSource,
  ){}

  async create(dto: CreateTransactionDto) {
    const account = await this.accountService.findOne(dto.senderAccountId)
    if(account.balance - account.reservedBalance<dto.amount)
      throw new Error("Insufficient funds")

    return await this.dataSource.transaction(async (manager)=> {
      const newTransaction = await manager.insert(Transaction,{
        amount: dto.amount,
        status: "PENDING",
        senderAccountId: dto.senderAccountId,
        providerTransactionId: dto.providerTransactionId,
        receiverAccountId: dto.receiverAccountId
      })

      await manager.increment(Account, {id:dto.senderAccountId}, 'reservedBalance', dto.amount)

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
    const transaction = await this.transactionRepository.findOneBy({providerTransactionId:id})
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction
  }

  async findByAccount(accountId: string): Promise<Transaction[]> {
    const transaction = await this.transactionRepository.find({ where: [{ senderAccountId: accountId }, { receiverAccountId: accountId }] });
    if (!transaction) throw new NotFoundException('No transaction found');
    return transaction
  }

}
