// src/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule], 
  providers: [], // Removido NotificationsService
})
export class NotificationsModule {}