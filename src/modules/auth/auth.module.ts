import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { envVars } from 'src/config';
import { LocalStrategy, JwtStrategy } from './strategy';
@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: envVars.secret.jwt,
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
