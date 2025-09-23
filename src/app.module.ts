import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { dataSourceOptions } from './database/data-source';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // Módulo para gerir variáveis de ambiente
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Módulo de conexão com o banco de dados TypeORM
    TypeOrmModule.forRoot(dataSourceOptions),
    HealthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
