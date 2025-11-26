// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config'; // 1. Importar

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService, // 2. Injetar
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'), // 3. Usar
    });
  }

  async validate(payload: any) {
    // O payload é o que definimos no método login do auth.service
    // { email: user.email, sub: user.id, role: user.role }
    // O NestJS vai anexar este retorno ao objeto `request.user`
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}