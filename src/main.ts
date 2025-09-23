import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  
  const PORT = process.env.PORT || 3000;

  await app.listen(PORT);

  logger.log(`🚀 Aplicação rodando na porta: ${PORT}`);
  logger.log(`✅ Health check disponível em http://localhost:${PORT}/health`);
  logger.log(`Running in ${process.env.NODE_ENV || 'development'} mode`);
}
bootstrap();