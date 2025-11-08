// src/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule], // Importamos ConfigModule se quisermos usar API keys de email
  providers: [NotificationsService],
})
export class NotificationsModule {}