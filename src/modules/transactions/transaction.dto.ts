import { IsUUID, IsNumber, IsString, IsIn } from 'class-validator';

export class CreateTransactionDto {
    @IsUUID()
    senderAccountId: string;

    @IsUUID()
    receiverAccountId: string;

    @IsString()
    providerTransactionId: string;

    @IsNumber()
    amount: number;

    @IsString()
    @IsIn(['USD', 'EUR', 'GBP'])
    currency: string;
}

export class DepositDto {
    @IsUUID()
    accountId: string

    @IsNumber()
    amount: number
}
