import { Module } from '@nestjs/common';
// import { UserModule } from 'src/modules/users/user.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
// import { UserService } from '../users/user.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: String(process.env.APP_SECRET),
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
