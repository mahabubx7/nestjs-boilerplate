import { Request as RequestType } from 'express';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { TokenPayload } from './types';
import { envVars } from 'src/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      ignoreExpiration: false,
      secretOrKey: envVars.secret.jwt,
      jwtFromRequest: ExtractJwt.fromExtractors([JwtStrategy.extractJWT]), // ExtractJwt.fromAuthHeaderAsBearerToken()
    });
  }

  private static extractJWT(req: RequestType): string | null {
    if (req.cookies && 'jwt_token' in req.cookies) {
      return req.cookies.jwt_token;
    }
    return null;
  }

  async validate(payload: TokenPayload) {
    return payload;
  }
}
