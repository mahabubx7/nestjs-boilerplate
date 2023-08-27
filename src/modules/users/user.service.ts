import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { passwordHelper } from 'src/common/helper';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto, LoginDto } from './dto';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) {}

  async create(createUserDto: CreateUserDto) {
    const newUser = this.userRepo.create(createUserDto);
    return await this.userRepo.save(newUser);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: loginDto.email } });
    if (!user) {
      throw new HttpException('User not found on this email id', HttpStatus.NOT_FOUND);
    }
    const verifiedUser = await passwordHelper.verifyPassword(loginDto.password, user.password);
    if (!verifiedUser) {
      throw new HttpException('Invalid credentials', HttpStatus.NOT_FOUND);
    }
    delete user.password;
    return user;
  }

  async findOne(id: number) {
    return await this.userRepo.findOne({
      where: { id },
      select: ['id', 'email', 'name', 'createdAt', 'updatedAt'],
    });
  }

  async findByEmail(email: string) {
    return await this.userRepo.findOne({
      where: { email },
      select: ['id', 'email', 'name', 'createdAt', 'updatedAt'],
    });
  }

  async getUserInfo(id: number) {
    return await this.userRepo.findOne({
      where: { id },
      select: ['id', 'email', 'name', 'createdAt', 'updatedAt'],
      relations: {
        roles: true,
      },
    });
  }
}
