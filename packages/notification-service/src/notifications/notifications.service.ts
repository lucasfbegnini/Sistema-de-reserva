// packages/notification-service/src/notifications/notifications.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { BookingCreatedEvent } from '../dto/create-booking.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly mailerService: MailerService) {}

  async handleBookingCreated(data: BookingCreatedEvent) {
    this.logger.log(`-------------------------------------------------`);
    this.logger.log(`[MICROSERVICO] ✅ EVENTO: Reserva Criada recebido!`);
    this.logger.log(`   > ID da Reserva: ${data.id}`);
    this.logger.log(`   > Sala: ${data.room.name}`);
    this.logger.log(`   > Usuário: ${data.user.email}`);
    this.logger.log(`   > Início: ${new Date(data.startTime).toLocaleString('pt-BR')}`);
    this.logger.log(`-------------------------------------------------`);
  }
    /*
    função de envio de e-mail comentada para evitar erros, o MailerService não estiver configurado
    try {
      await this.mailerService.sendMail({
        to: data.user.email,
        subject: `Reserva Confirmada: ${data.room.name}`,
        html: `
          <h1>Olá,</h1>
          <p>Sua reserva para a sala <strong>${data.room.name}</strong> foi confirmada.</p>
          <p>Início: ${new Date(data.startTime).toLocaleString()}</p>
        `,
      });
      this.logger.log(`E-mail enviado para ${data.user.email}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar e-mail: ${error.message}`);
    }*/

  async handleBookingCancelled(data: BookingCreatedEvent) {
    this.logger.log(`-------------------------------------------------`);
    this.logger.log(`[MICROSERVICO] ❌ EVENTO: Reserva Cancelada recebido!`);
    this.logger.log(`   > ID da Reserva: ${data.id}`);
    this.logger.log(`   > Sala: ${data.room.name}`);
    this.logger.log(`   > Usuário: ${data.user.email}`);
    this.logger.log(`   > Início: ${new Date(data.startTime).toLocaleString('pt-BR')}`);
    this.logger.log(`-------------------------------------------------`);
    /*
    função de envio de e-mail comentada para evitar erros, o MailerService não estiver configurado
    try {
      await this.mailerService.sendMail({
        to: data.user.email,
        subject: `Reserva Cancelada: ${data.room.name}`,
        html: `
          <h1>Olá,</h1>
          <p>Sua reserva para a sala <strong>${data.room.name}</strong> foi cancelada.</p>
          <p>Início: ${new Date(data.startTime).toLocaleString()}</p>
        `,
      });
      this.logger.log(`E-mail enviado para ${data.user.email}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar e-mail: ${error.message}`);
    }*/
  }
}