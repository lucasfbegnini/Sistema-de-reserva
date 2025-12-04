import { Controller } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { MessagePattern, Payload } from '@nestjs/microservices';

// Interface para estender o Request do Express e incluir nosso usuário
interface RequestWithUser extends Request {
  user: {
    userId: number;
    email: string;
  };
}


@Controller()
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  // --- CRUD de Salas ---
  @MessagePattern({ cmd: 'create_room' })
  create(@Payload() data: { dto: CreateRoomDto;  req: RequestWithUser }) {
    return this.roomsService.create(
      data.dto, 
      data.req.user.userId
    );
  }

  @MessagePattern({ cmd: 'find_all_rooms' })
  findAll(@Payload() data: { minCapacity?: number; resources?: number[] }) {
    return this.roomsService.findAll(
      data?.minCapacity, 
      data?.resources
    );
  }

  @MessagePattern({ cmd: 'find_one_room' })
  findOne(@Payload() data: { id: number }) {
    return this.roomsService.findOne(
      data.id
    );
  }

  @MessagePattern({ cmd: 'update_room' })
  update(@Payload() data: { id: number; dto: UpdateRoomDto; req: RequestWithUser }) {
    return this.roomsService.update(
      data.id,
      data.dto,
      data.req.user.userId
    );
  }

  @MessagePattern({ cmd: 'remove_room' })
  remove(@Payload() data: { id: number; req: RequestWithUser }) {
    return this.roomsService.remove(
      data.id, 
      data.req.user.userId
    );
  }

  // --- Associação Sala-Recurso ---
  @MessagePattern({ cmd: 'add_resource_to_room' })
  addResources(@Payload() data: { roomId: number, resourceIds: number[], adminId: number }) {
    return this.roomsService.addResources(data.roomId, data.resourceIds, data.adminId);
  }

  @MessagePattern({ cmd: 'remove_resource_from_room' })
  removeResources(@Payload() data: { roomId: number, resourceIds: number[], adminId: number }) {
    return this.roomsService.removeResources(data.roomId, data.resourceIds, data.adminId);
  }
}