import { IsUUID, IsNumber, IsString, IsIn } from 'class-validator';
import { LedgerCategory, LedgerType } from './ledger.entity';

export class CreateLedgerDto {
    @IsNumber()
    amount!: number;
    
    @IsUUID()
    accountId!: string;

    @IsUUID()
    transactionId!: string;

    @IsString()
    type!: LedgerType;

    @IsString()
    category!: LedgerCategory
}
