import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  ownerName: string;

  @Column()
  balance: number;

  @Column({ default: true })
  isActive: boolean;
}
