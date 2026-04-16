import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, Unique } from 'typeorm';

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

  @Column()
  type!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}