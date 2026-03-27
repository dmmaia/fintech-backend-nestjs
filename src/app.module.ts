import { Module } from '@nestjs/common';
import { AccountsModule } from './modules/accounts/accounts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgresConfigService } from './config/database.config';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LedgerModule } from './modules/ledger/ledger.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({envFilePath:['env.dev','.env'],isGlobal:true}),
    TypeOrmModule.forRootAsync({
      imports:[ConfigModule],
      useClass: PostgresConfigService,
    }),
    JwtModule.registerAsync({
        useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET'),
            signOptions: {
                expiresIn: configService.get<number>('JWT_EXPIRATION_TIME')??'1h',
            },
        }),
        inject: [ConfigService],
        global:true
    }),
    EventEmitterModule.forRoot(),
    AccountsModule,
    TransactionsModule,
    LedgerModule,
    UsersModule,
    AuthModule
  ]
})
export class AppModule {}
