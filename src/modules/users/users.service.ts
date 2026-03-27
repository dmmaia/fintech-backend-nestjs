
import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './users.dto';

@Injectable()
export class UsersService {
     constructor(
        @InjectRepository(User) private readonly accountRepository: Repository<User>
      ){}

    create(createAccountDto: CreateUserDto) {
        return this.accountRepository.create(createAccountDto)
      }

    async findOne(id: string){
      const account = await this.accountRepository.findOneBy({id})
      if(!account) throw new NotFoundException('User not found')
      return account
    }
}
