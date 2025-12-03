import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ResourcesModule } from './resources/resources.module';
import { AuthModule } from './auth/auth.module';
import { Resource } from './resources/entities/resource.entity';
import { Room } from './rooms/entities/room.entity';

@Module({
  imports: [
    // Lê o .env da raiz do monorepo
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env', 
    }),
    // Configura o banco de dados
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get<string>('DB_PATH_RESOURCES', 'resources.sqlite'),
        entities: [Resource, Room], // Carrega os schemas
        synchronize: true, // Cria as tabelas automaticamente
      }),
    }),
    ResourcesModule,
    AuthModule,
  ],
})
export class AppModule {}