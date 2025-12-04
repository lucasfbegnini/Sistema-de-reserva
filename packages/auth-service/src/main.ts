import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração do Microsserviço TCP
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0', // Obrigatório para Docker
      port: 3001,      // Porta TCP específica do Auth
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000); // Porta HTTP interna
  console.log(`Auth Service is running on HTTP:3000 and TCP:3001`);
}
bootstrap();