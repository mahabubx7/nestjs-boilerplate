import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto } from '../users/dto';
// import RequestWithUser from './request-with-user-interface';
// import { JwtAuthenticationGuard } from './jwt.auth.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto);
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  async login(@Body() loginDto: LoginDto, @Req() req, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.login(loginDto);
    // request.user = user;
    const token = this.authService.getCookieWithJwtToken(user.id);
    res.cookie('jwt_token', token, { httpOnly: true, expires: new Date(Date.now() + 60000) });
    return { message: 'Login success!', data: user };
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async profile(@Req() req) {
    // const { user } = request;
    // console.log('user-data =>', user);
    const token = req.cookies['jwt_token'];
    console.log('user-cookie => ', token);
    const data = await this.authService.verifyJwt(token);

    return { profile: 'profile data', data };
  }

  // @Post('login')
  // async login(@Body() loginDto: LoginDto, @Req() request: RequestWithUser, @Res({ passthrough: true }) response) {
  //   const { user } = request;
  //   console.log('req-user', user);
  //   const cookie = this.authService.getCookieWithJwtToken(user.id);
  //   delete user.password;
  //   response.setHeader('Set-Cookie', cookie);
  //   response.send(user);
  // }
  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt_token');
    return {
      message: 'Logout success!',
    };
  }
}
