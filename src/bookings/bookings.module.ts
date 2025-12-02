// src/bookings/bookings.module.ts
import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { RoomsModule } from '../rooms/rooms.module'; // Importante
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    RoomsModule, // Precisamos do RoomsService para validar a sala
    ClientsModule.register([
      {
        name: 'NOTIFICATIONS_SERVICE', // Nome para injetar depois
        transport: Transport.TCP,
        options: {
          host: 'notifications-service', // Se usar Docker, coloque o nome do serviço no docker-compose (ex: 'notification-service')
          port: 3002,
        },
      },
    ]),
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}