import { Controller, Post, UseGuards, Request, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { LocalStrategy } from './local.strategy';
import { Public } from './public.decorator';
import { lastValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy
  ) {}

  @Public()
  @UseGuards(LocalStrategy)//chama a strategy local (chamando o microserviço de validação)
  @Post('login')
  async login(@Request() req) {
    return await lastValueFrom(
      this.authClient.send({ cmd: 'login' }, req.user)
    );
  }
}