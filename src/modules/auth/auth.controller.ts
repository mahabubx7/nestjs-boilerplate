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
  Param,
  Put,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto';
import { JwtAuthGuard, JwtRefreshAuthGuard } from './guards';
import { LocalAuthGuard } from './guards/local.guard';
import { cookieOptions } from 'src/config';
import { ResendEmailDto, ResetPasswordDto } from './dto';

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

  /* Activate account after registration */
  @Get('register/confirm/:token')
  async activateAccountAfterRegistration(@Param('token') token: string) {
    await this.authService.activeAccountAfterSignup(token);

    return { success: true, message: 'Account verified successfully please login' };
  }

  /* Resend account activation email address to user */
  @Post('register/resend-email')
  async resendVerificationEmail(@Body() emailDto: ResendEmailDto) {
    await this.authService.resendVerificationEmail(emailDto);

    return {
      success: true,
      message: `Email sent to ${emailDto.email}, checkout your email inbox to activate your account`,
    };
  }

  /* Forgot password email reset link */
  @Post('forgot-password')
  async sendForgotPasswordEmailResetLink(@Body() emailDto: ResendEmailDto) {
    await this.authService.forgotPassword(emailDto);

    return {
      success: true,
      message: `Email sent to ${emailDto.email}, checkout your email inbox to reset your password`,
    };
  }

  /* Verify reset password token validity */
  @Get('forgot-password/verify/:token')
  async verifyResetPasswordToken(@Param('token') token: string) {
    await this.authService.verifyResetPasswordToken(token);

    return { success: true, message: 'Reset password link verified successfully' };
  }

  /* Insert new password */
  @Put('forgot-password/new/:token')
  async enterNewPassword(@Body() passwordDto: ResetPasswordDto, @Param('token') token: string) {
    await this.authService.enterNewPassword(token, passwordDto);

    return { success: true, message: 'Your password has been reset successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('logout')
  async logout(@Res({ passthrough: true }) res) {
    res.clearCookie('access_token');
    return {
      message: 'Logged-out successfully!',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('remove')
  async removeAccount(@Req() req, @Res({ passthrough: true }) res) {
    const { user } = req;
    await this.authService.deleteAccount(user);
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return {
      message: 'Your account has been deleted successfully!',
    };
  }
}
