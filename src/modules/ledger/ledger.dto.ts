import { IsUUID, IsNumber, IsString, IsIn } from 'class-validator';

export class CreateLedgerDto {
    @IsNumber()
    amount: number;
    
    @IsUUID()
    accountId: string;

    @IsUUID()
    transactionId: string;

    @IsString()
    type: string;
}
