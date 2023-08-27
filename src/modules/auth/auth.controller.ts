import { Body, Controller, Delete, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto } from '../users/dto';
import { JwtAuthGuard } from './auth.guard';
import { cookieOptions } from 'src/config';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const data = await this.authService.register(createUserDto);
    return { message: 'Registered successfully!', data };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.login(loginDto);
    const { id, email } = user;
    const token = await this.authService.signJwt({ id, email });
    res.cookie('jwt_token', token, cookieOptions);
    return { message: 'Logged-in successfully!', data: user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async profile(@Req() req) {
    const token = req.cookies['jwt_token'];
    const data = await this.authService.verifyJwt(token);
    return { message: 'User<Profile>', data };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt_token');
    return {
      message: 'Logged-out successfully!',
    };
  }
}
