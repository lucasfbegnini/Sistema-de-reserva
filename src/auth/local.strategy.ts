import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy
  ) {
    super({ usernameField: 'email' }); // Configura para usar email em vez de username
  }

  async validate(email: string, pass: string): Promise<any> {
    // 1. Manda email/senha pro Microserviço validar
    try {
      const user = await lastValueFrom(
        this.authClient.send({ cmd: 'validate_user' }, { email, pass })
      );
      
      if (!user) {
        throw new UnauthorizedException('Credenciais inválidas');
      }
      return user;
    } catch (e) {
      throw new UnauthorizedException('Falha na autenticação');
    }
  }
}