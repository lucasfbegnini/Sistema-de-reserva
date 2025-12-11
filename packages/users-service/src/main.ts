import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
//comeentario de teste
async function bootstrap() {
  // Cria a aplicação HTTP (para endpoints REST, se houver)
  const app = await NestFactory.create(AppModule);

  // Conecta o Microserviço TCP na porta 3003
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0', // Importante para aceitar conexões externas no Docker
      port: 3003,
    },
  });

  // Inicia os microserviços e depois o servidor HTTP
  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Users Service is running on HTTP:3000 and TCP:3003`);
}
bootstrap();