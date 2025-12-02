import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'login' })
  async login(@Payload() data: LoginAuthDto) {
    const user = await this.authService.validateUser(data.email, data.password);
    if (!user) {
      return { error: 'Credenciais inválidas', status: 401 };
    }
    return this.authService.login(user);
  }
}