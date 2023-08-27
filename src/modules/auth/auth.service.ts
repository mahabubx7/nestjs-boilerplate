import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, LoginDto } from '../users/dto';
import { TokenPayload } from './types';
import { envVars } from 'src/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  public async register(userDto: CreateUserDto) {
    try {
      const createdUser = await this.userService.create(userDto);
      delete createdUser.password;
      return createdUser;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async login(loginDto: LoginDto) {
    try {
      const user = await this.userService.login(loginDto);
      return user;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async signJwt(payload: TokenPayload) {
    return await this.jwtService.signAsync(payload, { secret: envVars.secret.jwt });
  }

  public async verifyJwt(token: string) {
    const parsed = await this.jwtService.verifyAsync(token, {
      secret: envVars.secret.jwt,
    });

    if (!parsed.id || !parsed.email) {
      throw new HttpException('Jwt data broken', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const info = await this.userService.getUserInfo(parsed.id);
    return info;
  }
}
