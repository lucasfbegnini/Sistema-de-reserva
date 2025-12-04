import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    // Conecta ao Bookings Microservice na porta 3006
    ClientsModule.register([
      {
        name: 'BOOKINGS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.BOOKINGS_HOST || 'bookings-service',
          port: 3006,
        },
      },
    ]),
  ],
  controllers: [BookingsController],
  providers: [], // VAZIO: Sem service local
  exports: [ClientsModule],
})
export class BookingsModule {}