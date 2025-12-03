import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RoomsModule } from './rooms/rooms.module';
import { AuthModule } from './auth/auth.module';
import { Room } from './rooms/entities/room.entity';
import { Resource } from './resources/entities/resource.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env', 
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get<string>('DB_PATH_ROOMS', 'rooms.sqlite'),
        entities: [Room, Resource],
        synchronize: true, // Importante para criar a tabela room_resource
      }),
    }),
    RoomsModule,
    AuthModule,
  ],
})
export class AppModule {}