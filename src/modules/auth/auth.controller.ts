import {
  Body,
  Controller,
  Delete,
  Post,
  Res,
  UseGuards,
  Request,
  Get,
  Req,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto';
import { JwtAuthGuard, JwtRefreshAuthGuard } from './guards';
import { LocalAuthGuard } from './guards/local.guard';
import { cookieOptions } from 'src/config';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const data = await this.authService.register(createUserDto);
    return { message: 'Registered successfully!', data };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) res) {
    const { accessToken, refreshToken, ...response } = await this.authService.login(req.user);
    res.cookie('access_token', accessToken, cookieOptions);
    res.cookie('refresh_token', refreshToken, cookieOptions);
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async profile(@Req() req) {
    const { user } = req;
    return { user };
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Get('refresh')
  async refreshToken(@Req() req, @Res({ passthrough: true }) res) {
    const { cookies } = req;

    if (!cookies.refresh_token) {
      throw new BadRequestException('Invalid token-refresh request!');
    }

    try {
      const { accessToken, refreshToken, ...login } = await this.authService.refreshTokens(cookies.refresh_token);
      res.cookie('access_token', accessToken, cookieOptions);
      res.cookie('refresh_token', refreshToken, cookieOptions);
      return { ...login };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('logout')
  async logout(@Res({ passthrough: true }) res) {
    res.clearCookie('access_token');
    return {
      message: 'Logged-out successfully!',
    };
  }
}
