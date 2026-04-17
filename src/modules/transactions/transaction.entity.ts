import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

export enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity({ name: 'transactions' })
@Unique(['providerTransactionId'])
export class Transaction {
  @PrimaryColumn()
  id!: string;

  @Column('int')
  amount!: number;

  @Column({ length: 3 })
  currency!: string;

  @Column()
  senderAccountId!: string;

  @Column()
  providerTransactionId!: string;

  @Column()
  receiverAccountId!: string;

  @Column({ type: 'enum', enum: OrderStatus ,default: OrderStatus.PENDING})
  status!: OrderStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}