import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { Booking } from './entities/booking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]), // Banco Local
    
    // Cliente para falar com o serviço de Salas (Porta 3004)
    ClientsModule.register([
      {
        name: 'ROOMS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.ROOMS_HOST || 'rooms-service',
          port: 3004,
        },
      },
      {
        name: 'NOTIFICATIONS_SERVICE',
        transport: Transport.TCP,
        options: { 
          host: process.env.NOTIFICATION_HOST || 'notification-service', 
          port: 3001 // Porta padrão ou a que você definiu no microservice
        },
      },
    ]),
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}