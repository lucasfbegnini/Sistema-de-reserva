import { Controller, Post, UseGuards, Inject, Body, HttpException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { LocalStrategy } from './local.strategy';
import { Public } from './public.decorator';
import { lastValueFrom } from 'rxjs';
import { ApiResponse, ApiOperation } from '@nestjs/swagger';
import { LoginAuthDto } from './dto/login-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy
  ) {}

  @Public()
  @UseGuards(LocalStrategy)//chama a strategy local (chamando o microserviço de validação)
  @Post('login')
  @ApiOperation({ summary: 'Realiza o login do usuário' })
  @ApiResponse({ status: 201, description: 'Login bem-sucedido' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() dto: LoginAuthDto) {
    try {
      const result = await lastValueFrom(this.authClient.send({ cmd: 'login' }, dto));
      if (result?.error) {
         throw new HttpException(result.error, result.status || 401);
      }
      return result;
    } catch (e) {
      throw new HttpException(e.message || 'Erro interno', e.status || 500);
    }
  }
}