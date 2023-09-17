import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserService } from '../users/user.service';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { CreateUserDto, LoginDto } from '../users/dto';
import { TokenPayload } from './types';
import { envVars } from 'src/config';
import { User } from '../users/entities/user.entity';

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
      throw new HttpException(err.message, HttpStatus.NOT_ACCEPTABLE);
    }
  }

  public async validateUser(loginDto: LoginDto) {
    try {
      const data = await this.userService.login(loginDto);
      return data;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  public async login(user: User) {
    const accessToken = await this.signJwt({ sub: user.id, email: user.email }, '15s');
    const refreshToken = await this.signJwt({ sub: user.id, email: user.email }, '60s');
    return {
      message: 'Logged-in successfully!',
      data: user,
      accessToken,
      refreshToken,
    };
  }

  public async signJwt(payload: TokenPayload, exp?: string) {
    const jwtSignOptions: JwtSignOptions = {
      secret: envVars.secret.jwt,
      expiresIn: exp || envVars.expires.jwt,
    };
    return await this.jwtService.signAsync(payload, jwtSignOptions);
  }

  public async verifyJwt(token: string) {
    const decoded = await this.jwtService.verifyAsync(token, {
      secret: envVars.secret.jwt,
      // ignoreExpiration: true,
    });

    if (!decoded.sub || !decoded.email) {
      throw new HttpException('Jwt data broken', HttpStatus.NOT_ACCEPTABLE);
    }

    const info = await this.userService.getUserInfo(decoded.id);
    return {
      info,
      decoded,
    };
  }

  public checkJwtExpires(exp: number): boolean {
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    return now > exp;
  }

  public async refreshTokens(token: string) {
    try {
      const { info, decoded } = await this.verifyJwt(token);
      if (this.checkJwtExpires(decoded.exp)) {
        console.log('expired  => ', decoded);
        throw new ForbiddenException('Token expired!');
      }
      const { accessToken, refreshToken, ...login } = await this.login(info);
      login.message = 'Tokens are refreshed!';
      return {
        accessToken,
        refreshToken,
        ...login,
      };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
}
