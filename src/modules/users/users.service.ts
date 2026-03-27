
import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './users.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
     constructor(
        @InjectRepository(User) private readonly accountRepository: Repository<User>
      ){}

    async create(createAccountDto: CreateUserDto) {
        createAccountDto.password = await bcrypt.hash(createAccountDto.password , 10)
        return this.accountRepository.create(createAccountDto)
      }

    async findOne(id: string){
      const account = await this.accountRepository.findOneBy({id})
      if(!account) throw new NotFoundException('User not found')
      return account
    }

    async findOneByEmail(email: string){
      const account = await this.accountRepository.findOneBy({email})
      if(!account) throw new NotFoundException('User not found')
      return account
    }
}
