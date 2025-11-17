// src/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Importe o ConfigService
import { MailerModule } from '@nestjs-modules/mailer'; // 1. Importe o MailerModule

@Module({
  imports: [
    ConfigModule, // Você já tinha este
    
    // 2. Configure o MailerModule
    MailerModule.forRootAsync({
      imports: [ConfigModule], // Importa o ConfigModule para usar o ConfigService
      inject: [ConfigService], // Injeta o ConfigService
      useFactory: (configService: ConfigService) => ({
        // Configuração do transporte (ex: SMTP)
        // É ALTAMENTE recomendado usar variáveis de ambiente aqui
        transport: {
          host: configService.get<string>('MAIL_HOST', 'smtp.example.com'),
          port: configService.get<number>('MAIL_PORT', 587),
          secure: configService.get<boolean>('MAIL_SECURE', false), // true para 465, false para outros
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASS'),
          },
        },
        defaults: {
          from: `"Sistema de Reserva" <${configService.get<string>('MAIL_FROM', 'nao-responda@exemplo.com')}>`,
        },
        // Se quiser usar templates (ex: Handlebars), configure aqui
      }),
    }),

  ],
  providers: [NotificationsService],
})
export class NotificationsModule {}