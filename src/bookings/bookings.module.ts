// src/bookings/bookings.module.ts
import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { RoomsModule } from '../rooms/rooms.module'; // Importante

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    RoomsModule, // Precisamos do RoomsService para validar a sala
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}