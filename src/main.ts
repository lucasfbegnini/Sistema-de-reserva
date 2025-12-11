import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
//comeentario de teste
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    forbidNonWhitelisted: true, 
    transform: true, 
  }));

  const config = new DocumentBuilder()
    .setTitle('Sistema de Reserva de Salas')
    .setDescription('API para o sistema de reserva de salas')
    .setVersion('1.0')
    .addTag('users', 'Operações relacionadas a usuários')
    .addTag('auth')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const PORT = process.env.PORT || 3000;

  await app.listen(PORT);

  logger.log(`🚀 Aplicação rodando na porta: ${PORT}`);
  logger.log(`✅ Health check disponível em http://localhost:${PORT}/health`);
  logger.log(`📖 Documentação da API disponível em http://localhost:${PORT}/api`);
  logger.log(`Running in ${process.env.NODE_ENV || 'development'} mode`);
}
bootstrap();