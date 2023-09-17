import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request as RequestType } from 'express';
import { envVars } from 'src/config';
// import { TokenPayload } from '../types';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([JwtRefreshStrategy.extractJwtFromCookie]),
      secretOrKey: envVars.secret.jwt,
      // ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  private static extractJwtFromCookie(req: RequestType): string | null {
    if (req.cookies && 'refresh_token' in req.cookies && req.cookies.refresh_token.length > 0) {
      return req.cookies.refresh_token;
    }
    return null;
  }

  public validate(payload: any) {
    // if (!payload || !payload.sub) {
    //   throw new UnauthorizedException();
    // }

    return payload;
  }
}
