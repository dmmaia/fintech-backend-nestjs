import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum Type {
  request = 'request',
  event = 'event',
  error = 'error',
}

@Entity()
export class Logger {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  level!: string;

  @Column({ type: 'enum', enum: Type})
  type!: Type;

  @Column()
  message!: string;
  
  @Column()
  requestId!: string;

  @Column()
  userId!: string;

  @Column()
  metadata!: Object;

  @CreateDateColumn()
  createdAt!: Date;
}
