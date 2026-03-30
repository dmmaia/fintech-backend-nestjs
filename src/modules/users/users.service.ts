
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './users.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid'

@Injectable()
export class UsersService {
     constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>
      ){}

    async create(createAccountDto: CreateUserDto) {
        var checkEmail = await this.userRepository.findOneBy({email:createAccountDto.email})
        if(checkEmail) throw new ConflictException("Email already in use!")
        const user: User = new User();
        user.email = createAccountDto.email
        user.name = createAccountDto.name
        user.password = await bcrypt.hash(createAccountDto.password , 10)
        this.userRepository.save(user)
      }

    async findOne(id: string){
      const account = await this.userRepository.findOneBy({id})
      if(!account) throw new NotFoundException('User not found')
      return account
    }

    async findOneByEmail(email: string){
      const account = await this.userRepository.findOneBy({email})
      if(!account) throw new NotFoundException('User not found')
      return account
    }
}
