// src/notifications/notifications.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Booking } from '../bookings/entities/booking.entity';

// Nomes dos eventos para evitar "magic strings"
export const BOOKING_CREATED_EVENT = 'booking.created';
export const BOOKING_CANCELLED_EVENT = 'booking.cancelled';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly adminNotificationEmail = 'patricksousabr280@gmail.com';

  constructor() {
    // Em um app real, injete aqui seu serviço de e-mail/Slack
    // constructor(private mailService: MailerService) {}
  }

  @OnEvent(BOOKING_CREATED_EVENT)
  async handleBookingCreatedEvent(booking: Booking) {
    this.logger.log(`[EVENTO RECEBIDO] ${BOOKING_CREATED_EVENT}`);
    this.logger.log(
      `Preparando e-mail para: ${this.adminNotificationEmail} (notificação sobre a reserva de ${booking.user.email})`
    );

    // ---- LÓGICA DE ENVIO DE E-MAIL (Simulado) ----
    // await this.mailService.send({
    //   to: booking.user.email,
    //   subject: `Reserva Confirmada: ${booking.room.name}`,
    //   template: 'booking-confirmed',
    //   context: {
    //     userName: booking.user.name,
    //     roomName: booking.room.name,
    //     startTime: booking.startTime,
    //     endTime: booking.endTime,
    //   },
    // });
    // ------------------------------------------

    this.logger.log(
      `[SIMULAÇÃO] E-mail de confirmação enviado para ${booking.user.email} para a sala ${booking.room.name}.`,
    );
  }

  @OnEvent(BOOKING_CANCELLED_EVENT)
  async handleBookingCancelledEvent(booking: Booking) {
    this.logger.log(`[EVENTO RECEBIDO] ${BOOKING_CANCELLED_EVENT}`);

    // ---- LÓGICA DE ENVIO DE E-MAIL (Simulado) ----
    // await this.mailService.send({ ... });
    // ------------------------------------------

    this.logger.log(
      `[SIMULAÇÃO] E-mail de cancelamento enviado para ${booking.user.email} sobre a sala ${booking.room.name}.`,
    );
  }
}