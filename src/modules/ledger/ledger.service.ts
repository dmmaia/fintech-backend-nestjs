import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateLedgerDto } from './ledger.dto';
import { LedgerEntry } from './ledger.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuid } from 'uuid'
import { AccountsService } from '../accounts/accounts.service';
import { Account } from '../accounts/account.entity';
import { Transaction } from '../transactions/transaction.entity';

@Injectable()
export class LedgerService {
  constructor(
    @InjectRepository(LedgerEntry) private readonly ledgerRepository: Repository<LedgerEntry>,
    private dataSource: DataSource,
     private accountService: AccountsService,
  ){}

  async create(dto: CreateLedgerDto) {
    await this.dataSource.transaction(async (manager)=>{
      if(dto.type=="DEBIT"){
        const account = await this.accountService.findOne(dto.accountId)
        if(account.balance - account.reservedBalance<dto.amount)
          throw new Error("Insufficient funds")
        await manager.increment(Account, {id:dto.accountId}, 'reservedBalance', dto.amount)
      }
      
      await manager.insert(LedgerEntry, {
        accountId: dto.accountId,
        amount: dto.amount,
        type: dto.type,
        transactionId:dto.transactionId
      })
      await manager.increment(Account, {id:dto.accountId}, 'balance', dto.type=="CREDIT"?dto.amount:-dto.amount)
      if(dto.type=="DEBIT"){
        await manager.increment(Account, {id:dto.accountId}, 'reservedBalance', -dto.amount)
      }
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
    await this.dataSource.transaction(async (manager)=>{
      await manager.insert(LedgerEntry, {
        accountId: senderId,
        amount: amount,
        type: 'FAILED',
        transactionId
      })
      await manager.increment(Account, {id:senderId}, 'reservedBalance', -amount)
      await manager.update(Transaction, {id:transactionId}, {status: "FAILED"})
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
      const entries = [
        {
          accountId: senderId,
          amount: -amount,
          type: 'DEBIT',
          transactionId
        },
        {
          accountId: receiverId,
          amount: amount,
          type: 'CREDIT',
          transactionId
        }
      ];
      const sum = entries.reduce((total, e) => total + e.amount, 0);

      if (sum !== 0) {
        throw new Error('Ledger imbalance');
      }

      await manager.insert(LedgerEntry, entries)
      
      await manager.increment(Account, {id: senderId}, 'balance', -amount)
      await manager.increment(Account, {id:senderId}, 'reservedBalance', -amount)
      await manager.increment(Account, {id: receiverId}, 'balance', amount)

      await manager.update(Transaction, {id: transactionId}, {status: "COMPLETED"})
    })
  }

}
