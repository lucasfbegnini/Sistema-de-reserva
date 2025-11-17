import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, In } from 'typeorm';
import { Room, RoomStatus } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { ResourcesService } from '../resources/resources.service'; // Importar ResourcesService

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
    // Injetar o ResourcesService para podermos buscar recursos
    private resourcesService: ResourcesService,
  ) {}

  // --- CRUD Básico ---

  create(createRoomDto: CreateRoomDto, userId: number): Promise<Room> {
    const room = this.roomsRepository.create({ 
        ...createRoomDto,
        createdById: userId, // AUDITORIA: Quem criou
        updatedById: userId, // AUDITORIA: Quem atualizou
    });
    return this.roomsRepository.save(room);
  }

  async findAll(minCapacity?: number, resourceIds?: number[]): Promise<Room[]> {
    const queryBuilder: SelectQueryBuilder<Room> = this.roomsRepository.createQueryBuilder('room')
      .leftJoinAndSelect('room.resources', 'resource')
      .where('room.status != :status', { status: RoomStatus.DEACTIVATED });

    if (minCapacity) {
      queryBuilder.andWhere('room.capacity >= :minCapacity', { minCapacity });
    }

    if (resourceIds && resourceIds.length > 0) {
      queryBuilder.andWhere(qb => {
        const subQuery = qb.subQuery()
          .select('1')
          .from('room_resource', 'rr')
          .where('rr.roomId = room.id')
          .andWhere('rr.resourceId IN (:...resourceIds)', { resourceIds })
          .groupBy('rr.roomId')
          .having('COUNT(DISTINCT rr.resourceId) = :resourceCount', { resourceCount: resourceIds.length })
          .getQuery();
        return `EXISTS ${subQuery}`;
      });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Room> {
    const room = await this.roomsRepository.findOne({
       where: { id, status: In([RoomStatus.AVAILABLE, RoomStatus.MAINTENANCE]) },
       relations: ['resources'],
      });
    if (!room) {
      throw new NotFoundException(`Sala com ID ${id} não encontrada ou está desativada.`);
    }
    return room;
  }

  async update(id: number, updateRoomDto: UpdateRoomDto, userId: number): Promise<Room> {
    // Usa TypeORM.preload e injeta o updatedById
    const room = await this.roomsRepository.preload({
      id: id,
      ...updateRoomDto,
      updatedById: userId, // AUDITORIA: Quem atualizou
    });
    if (!room) {
      throw new NotFoundException(`Sala com ID ${id} não encontrada.`);
    }
    if (room.status === RoomStatus.DEACTIVATED && updateRoomDto.status !== RoomStatus.DEACTIVATED) {
        const originalRoom = await this.roomsRepository.findOne({ where: { id } });
        if (originalRoom.status === RoomStatus.DEACTIVATED) {
             throw new BadRequestException('Não é possível modificar uma sala desativada por este endpoint.');
        }
    }

    return this.roomsRepository.save(room);
  }

  async remove(id: number, userId: number): Promise<void> {
    const room = await this.findOne(id);
    
    // Auditoria e Soft Delete
    room.updatedById = userId; 
    room.status = RoomStatus.DEACTIVATED;

    await this.roomsRepository.save(room);
  }

  // --- Associação com Recursos ---

  async addResourceToRoom(roomId: number, resourceId: number, userId: number): Promise<Room> {
    const room = await this.findOne(roomId);
    const resource = await this.resourcesService.findOne(resourceId);

    const resourceExists = room.resources.some(res => res.id === resourceId);
    if (resourceExists) {
       throw new BadRequestException(`O recurso com ID ${resourceId} já está associado à sala com ID ${roomId}.`);
    }

    room.resources.push(resource);
    room.updatedById = userId; // AUDITORIA
    return this.roomsRepository.save(room);
  }

  async removeResourceFromRoom(roomId: number, resourceId: number, userId: number): Promise<void> {
    const room = await this.findOne(roomId);

    const resourceIndex = room.resources.findIndex(res => res.id === resourceId);
    if (resourceIndex === -1) {
      throw new NotFoundException(`Recurso com ID ${resourceId} não encontrado na sala com ID ${roomId}.`);
    }

    room.resources.splice(resourceIndex, 1);
    room.updatedById = userId; // AUDITORIA
    await this.roomsRepository.save(room);
  }
}