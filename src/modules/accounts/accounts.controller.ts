import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './accounts.dto';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

 @Post()
  create(@Body() dto: CreateAccountDto){
    return this.accountsService.create(dto);
  }

  @Get()
  find() {
    return this.accountsService.find()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountsService.findOne(id)
  }

  @Get(':id/balance')
  balance(@Param('id') id: string) {
  }
}
