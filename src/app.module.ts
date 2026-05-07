import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from './logger/logger.module';
import { RequestMiddleware } from './middlewares/request.middleware';

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
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    AccountsModule,
    LoggerModule,
    TransactionsModule,
    LedgerModule,
    UsersModule,
    AuthModule,
    WebhooksModule
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestMiddleware)
      .forRoutes('');
  }
}
