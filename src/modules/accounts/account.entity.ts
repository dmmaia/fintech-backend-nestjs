import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Account {
  @PrimaryColumn()
  id: string;

  @Column()
  ownerName: string;

  @Column()
  balance: number;

  @Column({ default: true })
  isActive: boolean;
}
