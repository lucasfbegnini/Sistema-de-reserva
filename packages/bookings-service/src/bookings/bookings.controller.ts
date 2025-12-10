import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { QueryAvailabilityDto } from './dto/query-availability.dto';

@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @MessagePattern({ cmd: 'create_booking' })
  create(@Payload() data: { dto: CreateBookingDto, user: { userId: number; email: string; role: string } }) {
    return this.bookingsService.create(data.dto, data.user);
  }

  @MessagePattern({ cmd: 'find_user_bookings' })
  findAllForUser(@Payload() userId: number) {
    return this.bookingsService.findAllForUser(userId);
  }

  @MessagePattern({ cmd: 'find_all_bookings_admin' })
  findAllAdmin() {
    return this.bookingsService.findAllAdmin();
  }

  @MessagePattern({ cmd: 'find_room_availability' })
  findAvailability(@Payload() data: { roomId: number, query: QueryAvailabilityDto }) {
    return this.bookingsService.findAvailabilityForRoom(data.roomId, data.query);
  }

  @MessagePattern({ cmd: 'find_one_booking' })
  findOne(@Payload() data: { id: number }) {
    return this.bookingsService.findOne(data.id);
  }

  @MessagePattern({ cmd: 'cancel_booking' })
  cancel(@Payload() data: { id: number, userId: number }) {
    return this.bookingsService.cancel(data.id, data.userId);
  }
}