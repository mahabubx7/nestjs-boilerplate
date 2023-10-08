import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
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

  async save(user: User) {
    return await this.userRepo.save(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: loginDto.email },
      select: ['email', 'id', 'name', 'password', 'isActive', 'isEmailVerified'],
    });
    if (!user) {
      throw new HttpException('Wrong email or password!', HttpStatus.NOT_FOUND);
    }
    const verifiedUser = await passwordHelper.verifyPassword(loginDto.password, user.password);
    if (!verifiedUser) {
      throw new HttpException('Wrong password!', HttpStatus.NOT_FOUND);
    }
    delete user.password;
    return user;
  }

  async findOne(id: number) {
    return await this.userRepo.findOne({
      where: { id },
      select: ['id', 'email', 'name', 'createdAt', 'updatedAt', 'isActive', 'isEmailVerified'],
    });
  }

  async findByEmail(email: string) {
    return await this.userRepo.findOne({
      where: { email },
      select: ['id', 'email', 'name', 'createdAt', 'updatedAt', 'isActive', 'isEmailVerified'],
    });
  }

  async getUserInfo(id: number) {
    return await this.userRepo.findOne({
      where: { id },
      select: ['id', 'email', 'name', 'createdAt', 'updatedAt', 'isActive', 'isEmailVerified'],
      // relations: {
      //   roles: true,
      // },
    });
  }

  async updateUserInfo(user: Partial<User>) {
    return await this.userRepo.update(user.id, user);
  }

  async removeUser(email: LoginDto['email']) {
    const findUser = await this.findByEmail(email);

    if (!findUser) {
      throw new NotFoundException('User not found!');
    }

    return await this.userRepo.delete(findUser.id);
  }
}
