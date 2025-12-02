import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationsModule } from './notifications/notifications.module'; // <--- 1. Importar

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    NotificationsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}