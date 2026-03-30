import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateLedgerDto } from './ledger.dto';
import { LedgerEntry } from './ledger.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuid } from 'uuid'

@Injectable()
export class LedgerService {
  constructor(
    @InjectRepository(LedgerEntry) private readonly ledgerRepository: Repository<LedgerEntry>,
    private eventEmitter: EventEmitter2,
  ){}

  async create(dto: CreateLedgerDto) {
    var ledgerCheck = await this.ledgerRepository.findOneBy({transactionId: dto.transactionId,accountId:dto.accountId})
    if(ledgerCheck)throw new ConflictException('Transaction already registered')
    return await this.ledgerRepository.create(dto)
  }

  async findByAccount(accountId: string): Promise<LedgerEntry[]> {
    const ledger = await this.ledgerRepository.find({ where: [{ accountId }] });
    if (!ledger) throw new NotFoundException('No ledger found');
    return ledger
  }

}
