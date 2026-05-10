import { Injectable, NotFoundException } from '@nestjs/common';
import { LedgerEntry, LedgerCategory, LedgerType } from './ledger.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from '../accounts/account.entity';
import { Transaction, OrderStatus } from '../transactions/transaction.entity';
import { CreateLedgerDto } from './ledger.dto';
import { TransactionsService } from '../transactions/transactions.service';
import { LoggersService } from 'src/logger/logger.service';

@Injectable()
export class LedgerService {
  constructor(
    @InjectRepository(LedgerEntry) private readonly ledgerRepository: Repository<LedgerEntry>,
    private dataSource: DataSource,
     private transactionsService: TransactionsService,
     private loggersService: LoggersService
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
      this.loggersService.info("New "+dto.type+" ledger register created", {
          "type": dto.type,
          "status": "created"
      });
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
      this.loggersService.info("Reserve balance Ledger release created", {
          "action": "failed transaction",
        "status": "failed"
      });
      await manager.increment(Account, {id:senderId}, 'reservedBalance', -amount)
      
      this.loggersService.info("User balance released", {
        "action": "failed transaction",
        "status": "failed"
      });
      
      await manager.update(Transaction, {id:transactionId}, {status: OrderStatus.FAILED})
      this.loggersService.info("Transaction status changed", {
        "action": "failed transaction",
        "status": "failed"
      });
    })
  }

  async postDoubleEntry({
    transactionId,
    senderId,
    receiverId,
    amount
  }){
    if (amount <= 0) {
      this.loggersService.warn("Amount less than 0", {
          "action": "post double entry"
      });
      throw new Error('Invalid amount');
    }

    if (senderId === receiverId) {
      this.loggersService.warn("Sender and receiver are the same", {
         "action": "post double entry"
      });
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
        this.loggersService.warn("Ledger imbalance", {
            "action": "post double entry"
        });
        throw new Error('Ledger imbalance');
      }

      await manager.insert(LedgerEntry, entries)
      this.loggersService.info("Ledger double entry created", {
          "action": "post double entry"
      });
      await manager.insert(LedgerEntry, {
          accountId: senderId,
          amount: amount,
          type: LedgerType.CREDIT,
          category: LedgerCategory.RELEASE,
          transactionId
        },)
      this.loggersService.info("Reserve balance Ledger release created", {
          "action": "post double entry"
      });

      const users = [senderId, receiverId].sort()

      for( var id in users){
        await manager.findOne(Account, {
          where: { id: id },
          lock: { mode: 'pessimistic_write' }
        });
      }
    
      await manager.increment(Account, {id: senderId}, 'balance', -amount)
      this.loggersService.info("User sender balance debit", {
       "action": "post double entry"
      });
      await manager.increment(Account, {id:senderId}, 'reservedBalance', -amount)
      this.loggersService.info("User balance released", {
       "action": "post double entry"
      });
      await manager.increment(Account, {id: receiverId}, 'balance', amount)
      this.loggersService.info("User receiver balance credit", {
       "action": "post double entry"
      });

      await manager.update(Transaction, {id: transactionId}, {status: OrderStatus.COMPLETED})
      this.loggersService.info("Transaction status changed", {
        "action": "post double entry",
        "status": "completed"
      });
    })
  }

}
