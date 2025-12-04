import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { Room } from './entities/room.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room]), // Conecta no Banco
  ],
  controllers: [RoomsController],
  providers: [RoomsService], // Aqui SIM precisamos do Service com a lógica
})
export class RoomsModule {}