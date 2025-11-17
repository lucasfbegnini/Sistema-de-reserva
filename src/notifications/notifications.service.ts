// src/notifications/notifications.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Booking } from '../bookings/entities/booking.entity';
import { MailerService } from '@nestjs-modules/mailer'; // 1. Importe o MailerService

// Nomes dos eventos...
export const BOOKING_CREATED_EVENT = 'booking.created';
export const BOOKING_CANCELLED_EVENT = 'booking.cancelled';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly adminNotificationEmail = 'aristeuzandomenighi@gmail.com';

  constructor(
    // 2. Injete o serviço
    private readonly mailerService: MailerService,
  ) {}

  @OnEvent(BOOKING_CREATED_EVENT)
  async handleBookingCreatedEvent(booking: Booking) {
    this.logger.log(`[EVENTO RECEBIDO] ${BOOKING_CREATED_EVENT}`);
    
    // 3. Substitua a simulação pela lógica real
    try {
      await this.mailerService.sendMail({
        to: booking.user.email, // E-mail do usuário que reservou
        subject: `Reserva Confirmada: ${booking.room.name}`,
        // Você pode usar 'text' ou 'html'
        html: `
          <h1>Reserva Confirmada!</h1>
          <p>Olá, ${booking.user.name},</p>
          <p>Sua reserva para a sala <strong>${booking.room.name}</strong> foi confirmada.</p>
          <p><strong>Início:</strong> ${booking.startTime.toLocaleString()}</p>
          <p><strong>Fim:</strong> ${booking.endTime.toLocaleString()}</p>
        `,
      });
      this.logger.log(`E-mail de confirmação enviado para ${booking.user.email}`);

      // 4. (Opcional) Enviar notificação para o admin
      await this.mailerService.sendMail({
        to: this.adminNotificationEmail,
        subject: `[Admin] Nova Reserva: ${booking.room.name} por ${booking.user.name}`,
        html: `
          <p>Uma nova reserva foi criada:</p>
          <p><strong>Usuário:</strong> ${booking.user.name} (${booking.user.email})</p>
          <p><strong>Sala:</strong> ${booking.room.name}</p>
          <p><strong>Período:</strong> ${booking.startTime.toLocaleString()} - ${booking.endTime.toLocaleString()}</p>
        `,
      });
      this.logger.log(`Notificação de admin enviada para ${this.adminNotificationEmail}`);

    } catch (error) {
      this.logger.error(`Falha ao enviar e-mail de confirmação: ${error.message}`, error.stack);
    }
  }

  @OnEvent(BOOKING_CANCELLED_EVENT)
  async handleBookingCancelledEvent(booking: Booking) {
    this.logger.log(`[EVENTO RECEBIDO] ${BOOKING_CANCELLED_EVENT}`);

    // 5. Implemente o envio de e-mail de cancelamento
    try {
      await this.mailerService.sendMail({
        to: booking.user.email,
        subject: `Reserva Cancelada: ${booking.room.name}`,
        html: `
          <h1>Reserva Cancelada</h1>
          <p>Olá, ${booking.user.name},</p>
          <p>Sua reserva para a sala <strong>${booking.room.name}</strong> (Início: ${booking.startTime.toLocaleString()}) foi cancelada.</p>
        `,
      });
      this.logger.log(`E-mail de cancelamento enviado para ${booking.user.email}`);
      
      // 6. (Opcional) Notificar admin sobre o cancelamento
      await this.mailerService.sendMail({
        to: this.adminNotificationEmail,
        subject: `[Admin] Reserva Cancelada: ${booking.room.name}`,
        html: `<p>A reserva de ${booking.user.name} para a sala ${booking.room.name} (${booking.startTime.toLocaleString()}) foi cancelada.</p>`,
      });

    } catch (error) {
      this.logger.error(`Falha ao enviar e-mail de cancelamento: ${error.message}`, error.stack);
    }
  }
}