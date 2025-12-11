import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  
  @Get()
  check() {
    // Resposta simples, igual aos microsserviços
    return { status: 'ok', service: 'gateway' };
  }
}