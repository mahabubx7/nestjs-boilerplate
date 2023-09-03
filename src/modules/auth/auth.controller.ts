import { Body, Controller, Delete, Post, Res, UseGuards, Request, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto';
import { JwtAuthGuard } from './jwt.guard';
import { LocalAuthGuard } from './local.guard';
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
    const { accessToken, ...response } = await this.authService.login(req.user);
    res.cookie('access_token', accessToken, cookieOptions);
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async profile(@Req() req) {
    const { user } = req;
    return { user };
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
