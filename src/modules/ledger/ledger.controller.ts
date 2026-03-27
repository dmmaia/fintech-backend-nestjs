import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LedgerService } from './ledger.service';

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
