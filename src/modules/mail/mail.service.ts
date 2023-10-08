import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: User, token: string) {
    try {
      //
      await this.mailerService.sendMail({
        to: user.email,
        from: `<No Reply> ${process.env.MAIL_HOST_ADDRESS}`,
        subject: 'NestJS starter - Email verification!',
        html: `
        <div>
          <p>
            Hello <b>${user.name}</b>
          </p>
          <p>Please click on the link below in other to activate your account</p>
          <a target='_blank' href=${process.env.APP_DOMAIN}/api/auth/register/confirm/${token}>
            <b>Click here</b>
          </a>
        </div>
        `,
      });
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(err.message || 'Error at MailService');
    }
  }

  async sendForgetPasswordConfirmation(user: User, token: string) {
    try {
      //
      await this.mailerService.sendMail({
        to: user.email,
        from: `<No Reply> ${process.env.MAIL_HOST_ADDRESS}`,
        subject: 'NestJS starter - Reset Password',
        html: `
        <div>
          <p>Hello <b>${user.name}</b></p>
          <p>You have made a request to reset your password.</p>
          <p>If you did not made any request to reset your password please ignore this email!.</p>
          <p>Please click on the link below in other to reset your password</p>
          <a target='_blank' href=${process.env.APP_DOMAIN}/api/auth/forgot-password/new/${token}> <b>Click here</b></a>
        </div>`,
      });
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(err.message || 'Error at MailService');
    }
  }
}
