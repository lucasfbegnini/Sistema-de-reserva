import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { Room } from './entities/room.entity';
import { Resource } from '../resources/entities/resource.entity'; // Importa a entidade

@Module({
  // Registramos ambas as entidades
  imports: [TypeOrmModule.forFeature([Room, Resource])],
  controllers: [RoomsController],
  providers: [RoomsService],
})
export class RoomsModule {}