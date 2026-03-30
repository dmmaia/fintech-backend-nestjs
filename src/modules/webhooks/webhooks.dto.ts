import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ProviderWebhookDto {
    @ApiProperty()
    @IsString()
    providerTransactionId: string;

    @ApiProperty()
    @IsString()
    status: string;
}