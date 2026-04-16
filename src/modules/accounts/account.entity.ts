import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  ownerName!: string;

  @Column()
  balance!: number;

  @Column()
  reservedBalance!: number;

  @Column({ default: true })
  isActive!: boolean;

  @Column()
  user!: string;
}
