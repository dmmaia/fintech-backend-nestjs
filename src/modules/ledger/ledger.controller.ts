import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('ledger')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {
  }

  @Get(":accountId")
    findByAccount(@Param('accountId') accountId: string){

  }

  @Get(":accountId/entries")
    findentries(@Param('accountId') accountId: string){

  }
}
