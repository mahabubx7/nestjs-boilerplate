import { Request as RequestType } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { envVars } from 'src/config';
import { TokenPayload } from '../types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([JwtStrategy.extractJwtFromCookie]),
      ignoreExpiration: false,
      secretOrKey: envVars.secret.jwt,
    });
  }

  private static extractJwtFromCookie(req: RequestType): string | null {
    if (req.cookies && 'access_token' in req.cookies && req.cookies.access_token.length > 0) {
      return req.cookies.access_token;
    }
    return null;
  }

  async validate(payload: TokenPayload) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}
