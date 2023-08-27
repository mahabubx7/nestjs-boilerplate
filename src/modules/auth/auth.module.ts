import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { envVars } from 'src/config';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: envVars.secret.jwt,
      signOptions: { expiresIn: envVars.expires.jwt },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
