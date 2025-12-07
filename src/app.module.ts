import { Module } from '@nestjs/common';
import { AccountsModule } from './modules/accounts/accounts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'test',
      password: 'test',
      database: 'fintech',
      entities: [],
      synchronize: true,
    }),
    AccountsModule,
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
