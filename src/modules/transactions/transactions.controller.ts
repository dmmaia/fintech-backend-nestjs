import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto, DepositDto } from './transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('transfer')
  transfer(@Body() dto: CreateTransactionDto){
    return this.transactionsService.create(dto);
  }

  @Post('deposit')
  deposit(@Body() dto:DepositDto){
    return this.transactionsService.deposit(dto)
  }

  @Post('withdraw')
  withdraw(@Body() dto:DepositDto){
    return this.transactionsService.withdraw(dto)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  @Get('account/:id')
  findByAccount(@Param('id') id: string) {
    return this.transactionsService.findByAccount(id);
  }
}
