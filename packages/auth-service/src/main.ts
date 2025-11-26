import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    forbidNonWhitelisted: true, 
    transform: true, 
  }));

  const config = new DocumentBuilder()
    .setTitle('Auth Service')
    .setDescription('Microsserviço de Autenticação')
    .setVersion('1.0')
    .addTag('auth')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Use uma porta diferente do monólito (ex: 3001)
  await app.listen(3001);
  console.log(`Auth Service rodando na porta 3001`);
}
bootstrap();