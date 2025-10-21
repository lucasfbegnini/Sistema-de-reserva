import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config'; // Importar ConfigService

@Injectable()
export class JwtAuthGuard extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) { // Injetar ConfigService
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'), // Usar ConfigService para obter o segredo
    });
  }

  async validate(payload: any) {
    // O payload é o que definimos no método login do auth.service
    // { email: user.email, sub: user.id }
    // O NestJS vai anexar este retorno ao objeto `request`
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}