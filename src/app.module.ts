import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module'; // Importa o módulo de health check

@Module({
  imports: [
    HealthModule, // Registra o HealthModule para que o Nest saiba que ele existe
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}