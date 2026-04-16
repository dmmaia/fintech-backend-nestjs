import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAccountDto, UpdateAccountDto } from './accounts.dto';
import { Account } from './account.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account) private readonly accountRepository: Repository<Account>
  ){}

  create(createAccountDto: CreateAccountDto) {
    return this.accountRepository.create(createAccountDto)
  }
  update(id: string, updateAccountDto: UpdateAccountDto) {
    console.log(updateAccountDto);
    return `This action updates a #${id} account`;
  }

  async findOne(id: string){
    const account = await this.accountRepository.findOneBy({id})
    if(!account) throw new NotFoundException('Account not found')
    return account
  }
  async changeBalance(id, amount) {
    await this.accountRepository.increment({id}, 'balance', amount)
  }

  async find(){
    return await this.accountRepository.find()
  }

}
