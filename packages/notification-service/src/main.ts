import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
//comeentario de teste
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 3002,
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000);
  console.log(`Notification Service is running on HTTP:3000 and TCP:3002`);
}
bootstrap();