import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, Unique } from 'typeorm';

export enum LedgerCategory {
  RESERVE = 'RESERVE',
  RELEASE = 'RELEASE',
  SETTLEMENT = 'SETTLEMENT',
}

export enum LedgerType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT'
}

@Entity({ name: 'ledger' })
@Unique(['accountId', 'transactionId', 'type'])
export class LedgerEntry {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column('int')
  amount!: number;

  @Column()
  accountId!: string;

  @Column({nullable: false})
  transactionId!: string;

  @Column({ type: 'enum', enum: LedgerType})
  type!: LedgerType;

  @Column({ type: 'enum', enum: LedgerCategory})
  category!: LedgerCategory;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}