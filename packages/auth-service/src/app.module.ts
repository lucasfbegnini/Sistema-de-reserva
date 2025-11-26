import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Configuração do Banco de Dados
    TypeOrmModule.forRoot({
      type: 'sqlite',
      // CAMINHO IMPORTANTE: Aponta para o banco na raiz do projeto (fora da pasta packages)
      database: '../../database.sqlite', 
      entities: [User], // Apenas a entidade User é carregada
      synchronize: false, // Desligado para evitar conflitos de schema com o monólito
    }),
    AuthModule,
  ],
  controllers: [], // Você pode adicionar um AppController simples se quiser testar a raiz
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Mantém a proteção global, liberando apenas rotas @Public
    },
  ],
})
export class AppModule {}