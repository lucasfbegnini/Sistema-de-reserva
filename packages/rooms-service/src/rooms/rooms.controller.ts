import { Controller, Logger } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';


@Controller()
export class RoomsController {
  private readonly logger = new Logger(RoomsController.name);
  constructor(private readonly roomsService: RoomsService) {}

  // --- CRUD de Salas ---
  @MessagePattern({ cmd: 'create_room' })
  create(@Payload() data: { dto: CreateRoomDto;  idCreator: number }) {
    return this.roomsService.create(
      data.dto, 
      data.idCreator
    );
  }

  @MessagePattern({ cmd: 'find_all_rooms' })
  findAll(@Payload() data: any) {
    return this.roomsService.findAll();
  }

  @MessagePattern({ cmd: 'find_one_room' })
  findOne(@Payload() data: { id: number }) {
    return this.roomsService.findOne(
      data.id
    );
  }

  @MessagePattern({ cmd: 'update_room' })
  update(@Payload() data: { id: number; dto: UpdateRoomDto; idCreator: number }) {
    return this.roomsService.update(
      data.id,
      data.dto,
      data.idCreator
    );
  }

  @MessagePattern({ cmd: 'remove_room' })
  remove(@Payload() data: { id: number; idCreator: number }) {
    return this.roomsService.remove(
      data.id, 
      data.idCreator
    );
  }

  // --- Associação Sala-Recurso ---
  @MessagePattern({ cmd: 'add_resource_to_room' })
  addResources(@Payload() data: { id: number, resourceIds: number[], idCreator: number }) {
    this.logger.log("id recebido no controller: " + data.id);
    return this.roomsService.addResources(data.id, data.resourceIds, data.idCreator);
  }

  @MessagePattern({ cmd: 'remove_resource_from_room' })
  removeResources(@Payload() data: { roomId: number, resourceId: number, idCreator: number }) {
    return this.roomsService.removeResources(data.roomId, [data.resourceId], data.idCreator);
  }
}