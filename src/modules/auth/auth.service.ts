import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UserService } from '../users/user.service';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { CreateUserDto, LoginDto } from '../users/dto';
import { TokenPayload } from './types';
import { envVars } from 'src/config';
import { User } from '../users/entities/user.entity';
import { ResendEmailDto, ResetPasswordDto } from './dto';
import { MailService } from '../mail/mail.service';
import { hash } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(userDto: CreateUserDto) {
    try {
      const createdUser = await this.userService.create(userDto);

      const confirmationCodeToken = await this.signJwt({ sub: createdUser.id, email: createdUser.email }, '1h');

      createdUser.confirmationCode = confirmationCodeToken;
      console.log(envVars.mail);

      await this.userService.updateUserInfo(createdUser);

      /** 📧 👇 send email for user to activate account */
      await this.mailService.sendUserConfirmation(createdUser, confirmationCodeToken);
      delete createdUser.password;
      delete createdUser.confirmationCode;
      return createdUser;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.NOT_ACCEPTABLE);
    }
  }

  async validateUser(loginDto: LoginDto) {
    try {
      const data = await this.userService.login(loginDto);
      return data;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  async login(user: User) {
    const accessToken = await this.signJwt({ sub: user.id, email: user.email }, '7d');
    const refreshToken = await this.signJwt({ sub: user.id, email: user.email }, '30d');
    return {
      message: 'Logged-in successfully!',
      data: user,
      accessToken,
      refreshToken,
    };
  }

  async signJwt(payload: TokenPayload, exp?: string) {
    const jwtSignOptions: JwtSignOptions = {
      secret: envVars.secret.jwt,
      expiresIn: exp || envVars.expires.jwt,
    };
    return await this.jwtService.signAsync(payload, jwtSignOptions);
  }

  async verifyJwt(token: string) {
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

  checkJwtExpires(exp: number): boolean {
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    return now > exp;
  }

  async refreshTokens(token: string) {
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

  async activeAccountAfterSignup(token: string) {
    const decoded = await this.jwtService.verifyAsync(token, {
      secret: envVars.secret.jwt,
    });

    if (!decoded && !decoded.email) {
      console.error(decoded);
      throw new UnprocessableEntityException('Failed to verify activation link');
    }

    const user = await this.userService.findByEmail(decoded.email);
    await this.userService.updateUserInfo({
      id: user.id,
      isActive: true,
      isEmailVerified: true,
    });
  }

  async resendVerificationEmail(emailDto: ResendEmailDto): Promise<any> {
    const user = await this.userService.findByEmail(emailDto.email);

    if (!user) throw new NotFoundException('User with this email does not exist');

    /**Generate a confirmation token code that will be use to validate users token */
    const confirmationCodeToken = await this.signJwt({ sub: user.id, email: user.email }, '1h');

    await this.userService.updateUserInfo({ confirmationCode: confirmationCodeToken });

    /** 📧 👇 send email for user to activate account */
    await this.mailService.sendUserConfirmation(user, confirmationCodeToken);
  }

  async forgotPassword(emailDto: ResendEmailDto): Promise<any> {
    const user = await this.userService.findByEmail(emailDto.email);

    if (!user) throw new NotFoundException('User with this email does not exist');

    /**Generate a confirmation token code that will be use to validate users token */
    const confirmationCodeToken = await this.signJwt({ sub: user.id, email: user.email }, '1h');

    await this.userService.updateUserInfo({ confirmationCode: confirmationCodeToken });

    /** 📧 👇 send email for user to reset password */
    await this.mailService.sendForgetPasswordConfirmation(user, confirmationCodeToken);
  }

  /**Verify reset password token validity  */
  async verifyResetPasswordToken(token: string): Promise<any> {
    const decoded = await this.jwtService.verifyAsync(token, {
      secret: envVars.secret.jwt,
      // ignoreExpiration: true,
    });

    if (!decoded) {
      throw new UnprocessableEntityException('failed to verify reset password link');
    }

    const user = await this.userService.findByEmail(decoded.email);

    if (!user) {
      throw new UnprocessableEntityException("User doesn't exist!");
    }

    return true;
  }

  async enterNewPassword(token: string, resetPwd: ResetPasswordDto): Promise<any> {
    const decoded = await this.jwtService.verifyAsync(token, {
      secret: envVars.secret.jwt,
      // ignoreExpiration: true,
    });

    if (!decoded) {
      throw new UnprocessableEntityException('failed to verify reset password link');
    }

    const user = await this.userService.findByEmail(decoded.email);

    if (!user) {
      throw new UnprocessableEntityException("User doesn't exist!");
    }

    const hashedPassword: string = await hash(resetPwd.password, 10);

    await this.userService.updateUserInfo({ password: hashedPassword, confirmationCode: '' });
  }

  async deleteAccount(user: User) {
    try {
      await this.userService.removeUser(user.email);
    } catch (err) {
      throw new UnprocessableEntityException(err.message || 'Something went wrong!');
    }
  }
}
