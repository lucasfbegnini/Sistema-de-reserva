import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ROOMS_SERVICE', 
        transport: Transport.TCP,
        options: {
          host: process.env.ROOMS_HOST || 'rooms-service',
          port: 3004,
        },
      },
    ]),
  ],
  controllers: [RoomsController],
  providers: [],
  exports: [ClientsModule],
})
export class RoomsModule {}