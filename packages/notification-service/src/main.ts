// packages/notification-service/src/main.ts
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0', // Importante para Docker
        port: 3002,      // Porta diferente do Monólito (3000)
      },
    },
  );
  await app.listen();
  console.log('Microserviço de Notificações rodando na porta 3002 (TCP)');
}
bootstrap();