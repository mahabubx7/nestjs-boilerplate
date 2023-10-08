import { MailerModule } from '@nestjs-modules/mailer';
import { Module, Global } from '@nestjs/common';
import { MailService } from './mail.service';
import { envVars } from 'src/config';

@Global()
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        // host: 'smtp.gmail.com',
        // port: 587,
        service: 'gmail',
        // secure: envVars.mail.secure,
        auth: {
          user: envVars.mail.auth.user,
          pass: envVars.mail.auth.pass,
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
