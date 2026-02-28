import { Injectable, NotFoundException } from '@nestjs/common';
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
    return await this.ledgerRepository.create(dto)
  }

  async findByAccount(accountId: string): Promise<LedgerEntry[]> {
    const ledger = await this.ledgerRepository.find({ where: [{ accountId }] });
    if (!ledger) throw new NotFoundException('No ledger found');
    return ledger
  }

}
