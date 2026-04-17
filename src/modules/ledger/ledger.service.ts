import { Injectable, NotFoundException } from '@nestjs/common';
import { LedgerEntry, LedgerCategory, LedgerType } from './ledger.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from '../accounts/account.entity';
import { Transaction, OrderStatus } from '../transactions/transaction.entity';
import { CreateLedgerDto } from './ledger.dto';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class LedgerService {
  constructor(
    @InjectRepository(LedgerEntry) private readonly ledgerRepository: Repository<LedgerEntry>,
    private dataSource: DataSource,
     private transactionsService: TransactionsService,
  ){}

  async create(dto: CreateLedgerDto) {
    await this.dataSource.transaction(async (manager)=>{
      await manager.insert(LedgerEntry, {
        accountId: dto.accountId,
        amount: dto.amount,
        type: dto.type,
        category: LedgerCategory.SETTLEMENT,
        transactionId:dto.transactionId
      })
    })   
  }

  async findByAccount(accountId: string): Promise<LedgerEntry[]> {
    const ledger = await this.ledgerRepository.find({ where: [{ accountId }] });
    if (!ledger) throw new NotFoundException('No ledger found');
    return ledger
  }

  async findByTransaction(transactionId: string): Promise<LedgerEntry> {
    const ledger = await this.ledgerRepository.findOne({ where: { transactionId } });
    if (!ledger) throw new NotFoundException('No ledger found');
    return ledger
  }

  async failedTransaction({transactionId, senderId, amount}){
    const transaction = await this.transactionsService.findOne(transactionId)
    if (transaction.status !== 'PENDING') return;

    await this.dataSource.transaction(async (manager)=>{
      await manager.findOne(Account, {
        where: { id: senderId },
        lock: { mode: 'pessimistic_write' }
      });

      await manager.insert(LedgerEntry, {
        accountId: senderId,
        amount: amount,
        type: LedgerType.CREDIT,
        category: LedgerCategory.RELEASE,
        transactionId
      },)
      await manager.increment(Account, {id:senderId}, 'reservedBalance', -amount)
      await manager.update(Transaction, {id:transactionId}, {status: OrderStatus.FAILED})
    })
  }

  async postDoubleEntry({
    transactionId,
    senderId,
    receiverId,
    amount
  }){
    if (amount <= 0) {
      throw new Error('Invalid amount');
    }

    if (senderId === receiverId) {
      throw new Error('Sender and receiver cannot be the same');
    }

    await this.dataSource.transaction(async (manager) =>{
      await manager.findOne(Transaction, {
        where: { id: transactionId },
        lock: { mode: 'pessimistic_write' }
      });
      
      const entries = [
        {
          accountId: senderId,
          amount: -amount,
          type: LedgerType.DEBIT,
          category: LedgerCategory.SETTLEMENT,
          transactionId
        },
        {
          accountId: receiverId,
          amount: amount,
          type: LedgerType.CREDIT,
          category: LedgerCategory.SETTLEMENT,
          transactionId
        }
      ];
      const sum = entries.reduce((total, e) => total + e.amount, 0);

      if (sum !== 0) {
        throw new Error('Ledger imbalance');
      }

      await manager.insert(LedgerEntry, entries)
      await manager.insert(LedgerEntry, {
          accountId: senderId,
          amount: amount,
          type: LedgerType.CREDIT,
          category: LedgerCategory.RELEASE,
          transactionId
        },)
      
      await manager.findOne(Account, {
        where: { id: senderId },
        lock: { mode: 'pessimistic_write' }
      });
      await manager.findOne(Account, {
        where: { id: receiverId },
        lock: { mode: 'pessimistic_write' }
      });

      await manager.increment(Account, {id: senderId}, 'balance', -amount)
      await manager.increment(Account, {id:senderId}, 'reservedBalance', -amount)
      await manager.increment(Account, {id: receiverId}, 'balance', amount)

      await manager.update(Transaction, {id: transactionId}, {status: OrderStatus.COMPLETED})
    })
  }

}
