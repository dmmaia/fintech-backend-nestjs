import { IsString } from "class-validator";

export class ProviderWebhookDto {
    @IsString()
    providerTransactionId: string;

    @IsString()
    status: string;
}