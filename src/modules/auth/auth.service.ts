import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, LoginDto } from '../users/dto';

interface TokenPayload {
  userId: number;
}

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
      delete user.password;
      return user;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public getCookieWithJwtToken(userId: number) {
    const payLoad: TokenPayload = { userId };
    const token = this.jwtService.sign(payLoad);
    return token;
  }

  public async verifyJwt(token: string) {
    return await this.jwtService.verifyAsync(token);
  }
}
