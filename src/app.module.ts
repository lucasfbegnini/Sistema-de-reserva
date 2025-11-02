import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Importar ConfigModule
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RoomsModule } from './rooms/rooms.module';
import { ResourcesModule } from './resources/resources.module';
import { Room } from './rooms/entities/room.entity';
import { Resource } from './resources/entities/resource.entity';
import { BookingsModule } from './bookings/bookings.module'; 
import { Booking } from './bookings/entities/booking.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ // Adicionar ConfigModule
      isGlobal: true, // Tornar as variáveis de ambiente disponíveis globalmente
    }),
    EventEmitterModule.forRoot(),
    HealthModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [User, Room, Resource, Booking],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    RoomsModule,
    ResourcesModule,
    BookingsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}