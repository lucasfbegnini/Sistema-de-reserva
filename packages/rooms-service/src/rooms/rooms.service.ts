import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, In } from 'typeorm';
import { Room, RoomStatus } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomsRepository: Repository<Room>,
    @Inject('RESOURCES_SERVICE') private resourcesClient: ClientProxy,
  ) {}

  // --- CRUD Básico ---
  create(createRoomDto: CreateRoomDto, userId: number) {
    const room = this.roomsRepository.create({
      ...createRoomDto,
      status: RoomStatus.AVAILABLE,
      createdById: userId,
      updatedById: userId,
      resourceIds: [],
    });
    return this.roomsRepository.save(room);
  }

  async findAll(minCapacity?: number, requiredResources?: number[]): Promise<Room[]> {
    //busca todas as rooms
    const query = this.roomsRepository
      .createQueryBuilder('room')
      .where('room.status = :available OR room.status = :maintenance', {
        available: 'AVAILABLE',
        maintenance: 'MAINTENANCE',
      });

    //filtagem por capacidade minima (a qual pode ser indefinida)
    if (minCapacity) {
      query.andWhere('room.capacity >= :minCapacity', { minCapacity });
    }

    //filtragem por recursos (array de resourceIds)
    if (requiredResources && requiredResources.length > 0) {
      // O operador '@>' do Postgres verifica se o array da coluna contém o array passado
      query.andWhere('room.resourceIds @> :resources', { resources: requiredResources });
    }

    //faz a querry
    return query.getMany();
  }

  async findOne(id: number): Promise<Room> {
    const room = await this.roomsRepository.findOne({
       where: { id:id, status: In([RoomStatus.AVAILABLE, RoomStatus.MAINTENANCE]) }
      });
    if (!room) {
      throw new NotFoundException(`Sala com ID ${id} não encontrada ou está desativada.`);
    }

    const resources = await this.resourcesClient.send(
      'find_resources_by_ids', 
      room.resourceIds
    ).toPromise();

    return {
    ...room,
    resourceIds: resources,
  };
  }

  async update(id: number, updateRoomDto: UpdateRoomDto, userId: number) {
    const room = await this.findOne(id);
    this.roomsRepository.merge(room, updateRoomDto, { updatedById: userId });
    return this.roomsRepository.save(room);
  }

  async remove(id: number, userId: number): Promise<void> {
    const room = await this.findOne(id);
    room.updatedById = userId; 
    room.status = RoomStatus.DEACTIVATED;
    await this.roomsRepository.save(room);
  }

  // --- Associação com Recursos ---
  async addResources(roomId: number, resourceIdsToAdd: number[], userId: number) {
    const room = await this.findOne(roomId);
    
    // Garante unicidade dos IDs usando Set
    const currentIds = new Set(room.resourceIds || []);
    resourceIdsToAdd.forEach(id => currentIds.add(id));
    
    room.resourceIds = Array.from(currentIds);
    room.updatedById = userId;
    return this.roomsRepository.save(room);
  }

  async removeResources(roomId: number, resourceIdsToRemove: number[], userId: number) {
    const room = await this.findOne(roomId);
    
    const currentIds = room.resourceIds || [];
    room.resourceIds = currentIds.filter(id => !resourceIdsToRemove.includes(id));
    room.updatedById = userId;
    return this.roomsRepository.save(room);
  }
}