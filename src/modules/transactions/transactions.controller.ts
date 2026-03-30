import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto, DepositDto } from './transaction.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(AuthGuard)
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
