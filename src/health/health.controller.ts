import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HttpHealthIndicator, TypeOrmHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
    
  ) {}

  @Get()
  @HealthCheck()
  check() {
    // Você pode adicionar outras verificações aqui, como a conexão com o banco de dados.
    // Por exemplo: () => this.db.pingCheck('database')
    return this.health.check([
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
      () => this.db.pingCheck('database', { timeout: 300 }),
    ]);
  }
}