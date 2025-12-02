import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env', // Tenta ler da raiz se rodar local
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        // No Docker, isso será /app/data/database.sqlite
        database: configService.get<string>('DB_PATH', 'database.sqlite'),
        entities: [User],
        synchronize: true,
      }),
    }),
    AuthModule,
  ],
})
export class AppModule {}