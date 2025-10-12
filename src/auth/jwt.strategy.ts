import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'SEU_SEGREDO_SUPER_SECRETO', // Use a mesma chave secreta do auth.module!
    });
  }

  async validate(payload: any) {
    // O payload é o que definimos no método login do auth.service
    // { email: user.email, sub: user.id }
    // O NestJS vai anexar este retorno ao objeto `request`
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}