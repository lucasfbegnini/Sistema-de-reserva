import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { Room } from './entities/room.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room]), // Conecta no Banco
    ClientsModule.register([
      {
        name: 'RESOURCES_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.RESOURCES_HOST || 'resources-service',
          port: 3005,
        },
      },
    ]),
  ],
  controllers: [RoomsController],
  providers: [RoomsService], // Aqui SIM precisamos do Service com a lógica
})
export class RoomsModule {}