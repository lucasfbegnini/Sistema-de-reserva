import { Controller, Post, Body, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginAuthDto } from './dto/login-auth.dto';
import { lastValueFrom } from 'rxjs';
import { Public } from './public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(@Inject('AUTH_SERVICE') private client: ClientProxy) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Realiza o login do usuário' })
  @ApiResponse({ status: 201, description: 'Login bem-sucedido' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() dto: LoginAuthDto) {
    try {
      const result = await lastValueFrom(this.client.send({ cmd: 'login' }, dto));
      if (result?.error) {
         throw new HttpException(result.error, result.status || 401);
      }
      return result;
    } catch (e) {
      throw new HttpException(e.message || 'Erro interno', e.status || 500);
    }
  }
}