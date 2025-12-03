import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, In } from 'typeorm';
import { Room, RoomStatus } from './entities/room.entity';
import { Resource } from '../resources/entities/resource.entity'; // Importamos a entidade
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
    @InjectRepository(Resource) // Injetamos o repositório da entidade Resource
    private resourcesRepository: Repository<Resource>,
  ) {}

  // --- MÉTODOS CRUD (Create, FindAll, FindOne, Update, Remove) ---
  // (Copie a lógica original desses métodos do arquivo original src/rooms/rooms.service.ts
  // pois eles não dependem de ResourceService, apenas do repositório Room)
  
  create(createRoomDto: CreateRoomDto, userId: number): Promise<Room> {
    const room = this.roomsRepository.create({ 
        ...createRoomDto,
        createdById: userId,
        updatedById: userId,
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
    const room = await this.roomsRepository.preload({
      id: id,
      ...updateRoomDto,
      updatedById: userId,
    });
    if (!room) {
      throw new NotFoundException(`Sala com ID ${id} não encontrada.`);
    }
    if (room.status === RoomStatus.DEACTIVATED && updateRoomDto.status !== RoomStatus.DEACTIVATED) {
        const originalRoom = await this.roomsRepository.findOne({ where: { id } });
        if (originalRoom.status === RoomStatus.DEACTIVATED) {
             throw new BadRequestException('Não é possível modificar uma sala desativada.');
        }
    }
    return this.roomsRepository.save(room);
  }

  async remove(id: number, userId: number): Promise<void> {
    const room = await this.findOne(id);
    room.updatedById = userId; 
    room.status = RoomStatus.DEACTIVATED;
    await this.roomsRepository.save(room);
  }

  // --- Associação com Recursos (ADAPTADO) ---

  async addResourceToRoom(roomId: number, resourceId: number, userId: number): Promise<Room> {
    const room = await this.findOne(roomId);
    
    // ADAPTAÇÃO: Usamos o repositório local em vez do serviço externo
    const resource = await this.resourcesRepository.findOneBy({ id: resourceId });
    if (!resource) {
       // Nota: Em produção, se o banco for compartilhado ou sincronizado, isso funciona.
       // Se for totalmente isolado, precisaremos de um mecanismo de sync.
       throw new NotFoundException(`Recurso com ID ${resourceId} não encontrado no contexto de Rooms.`);
    }

    const resourceExists = room.resources.some(res => res.id === resourceId);
    if (resourceExists) {
       throw new BadRequestException(`O recurso com ID ${resourceId} já está associado à sala.`);
    }

    room.resources.push(resource);
    room.updatedById = userId;
    return this.roomsRepository.save(room);
  }

  async removeResourceFromRoom(roomId: number, resourceId: number, userId: number): Promise<void> {
    const room = await this.findOne(roomId);

    const resourceIndex = room.resources.findIndex(res => res.id === resourceId);
    if (resourceIndex === -1) {
      throw new NotFoundException(`Recurso com ID ${resourceId} não encontrado na sala.`);
    }

    room.resources.splice(resourceIndex, 1);
    room.updatedById = userId;
    await this.roomsRepository.save(room);
  }
}