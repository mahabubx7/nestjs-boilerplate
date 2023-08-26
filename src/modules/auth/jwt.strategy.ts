import { Request as RequestType } from 'express';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
// interface TokenPayload {
//   userId: number;
// }
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      ignoreExpiration: false,
      secretOrKey: 'My random secret key never let others',
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: RequestType) => {
          const data = request?.cookies['jwt_token'];
          if (!data) {
            return null;
          }
          return data;
        },
      ]),
    });
  }

  // private static extractJWT(req: RequestType): string | null {
  //   if (req.cookies && 'Authentication' in req.cookies && req.cookies.Authentication.length > 0) {
  //     return req.cookies.Authentication;
  //   }

  //   return null;
  // }

  async validate(payload: any) {
    if (payload === null) {
      throw new UnauthorizedException();
    }

    const verify = await this.authService.verifyJwt(payload);
    if (!verify) {
      throw new UnauthorizedException('Corrupted or expired JWT token');
    }

    return payload;
  }
}
