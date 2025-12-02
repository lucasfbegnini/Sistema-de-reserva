import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';
import { BookingCreatedEvent } from '../dto/create-booking.dto';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern('booking_created')
  handleBookingCreated(@Payload() data: BookingCreatedEvent) {
    return this.notificationsService.handleBookingCreated(data);
  }

  @EventPattern('booking_cancelled')
  handleBookingCancelled(@Payload() data: BookingCreatedEvent) {
    return this.notificationsService.handleBookingCancelled(data);
  }
}