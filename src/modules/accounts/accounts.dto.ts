import { PartialType } from "@nestjs/mapped-types";

export class CreateAccountDto {}
export class UpdateAccountDto extends PartialType(CreateAccountDto) {}
