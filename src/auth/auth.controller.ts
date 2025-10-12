import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from './public.decorator';

@ApiTags('auth') 
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Realiza o login do usuário' })
  @ApiResponse({ status: 201, description: 'Login bem-sucedido, retorna o token de acesso.' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  async login(@Body() loginAuthDto: LoginAuthDto) {
    const user = await this.authService.validateUser(loginAuthDto.email, loginAuthDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return this.authService.login(user);
  }
}