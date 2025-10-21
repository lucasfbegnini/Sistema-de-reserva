import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { ResourcesModule } from '../resources/resources.module'; // 1. Importe o ResourcesModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Room]),
    ResourcesModule, // 2. Adicione o ResourcesModule aqui
  ],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService], // Boa prática exportar o serviço
})
export class RoomsModule {}