import { Injectable, NotFoundException, BadRequestException, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Room, RoomStatus } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RoomsService {
  private readonly logger = new Logger(RoomsService.name);
  constructor(
    @InjectRepository(Room)
    private readonly roomsRepository: Repository<Room>,
    @Inject('RESOURCES_SERVICE') private resourcesClient: ClientProxy,
  ) {}

  // --- CRUD Básico ---
  create(createRoomDto: CreateRoomDto, idCreator: number) {
    const room = this.roomsRepository.create({
      ...createRoomDto,
      status: RoomStatus.AVAILABLE,
      createdById: idCreator,
      updatedById: idCreator,
      resourceIds: [],
    });
    return this.roomsRepository.save(room);
  }

  async findAll(minCapacity?: number, requiredResources?: number[]): Promise<Room[]> {
    const query = this.roomsRepository
      .createQueryBuilder('room')
      .where('room.status = :available OR room.status = :maintenance', {
        available: 'AVAILABLE',
        maintenance: 'MAINTENANCE',
      });

    const rooms = await query.getMany();
    return rooms;
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

  async update(id: number, updateRoomDto: UpdateRoomDto, idCreator: number) {
    const room = await this.findOneSimple(id);
    this.roomsRepository.merge(room, updateRoomDto, { updatedById: idCreator });
    await this.roomsRepository.save(room);
    const updatedRoom = await this.findOne(id);
    return updatedRoom;
  }

  async remove(id: number, idCreator: number): Promise<any> {
    const room = await this.findOneSimple(id);
    room.updatedById = idCreator; 
    room.status = RoomStatus.DEACTIVATED;
    await this.roomsRepository.save(room);
    return { success: true };
  }

  // --- Associação com Recursos ---
  async addResources(roomId: number, resourceIdsToAdd: number[], idCreator: number) {
    this.logger.log(`Iniciando adição de recursos à sala ID ${roomId}`);
    const room = await this.findOneSimple(roomId); 
    this.logger.log(`Adicionando recursos à sala ID ${room.id}: ${resourceIdsToAdd.join(', ')}`);
    
    // Inicializa se for null
    const currentIds = room.resourceIds || [];
    
    // Adiciona todas as novas IDs, incluindo duplicatas
    room.resourceIds = [...currentIds, ...resourceIdsToAdd]; 
    
    room.updatedById = idCreator;
    await this.roomsRepository.save(room);
    return this.findOne(roomId);
  }

  async removeResources(roomId: number, resourceIdsToRemove: number[], idCreator: number) {
    const room = await this.findOneSimple(roomId); 
    
    let currentIds = room.resourceIds || [];
    
    // Criamos uma cópia para modificação
    let modifiedIds = [...currentIds]; 

    resourceIdsToRemove.forEach(idToRemove => {
        const indexToRemove = modifiedIds.indexOf(idToRemove);
        
        // Se a ID for encontrada, remove APENAS essa ocorrência
        if (indexToRemove > -1) {
            // Usa splice para remover 1 elemento no índice encontrado
            modifiedIds.splice(indexToRemove, 1);
        } else {
            console.warn(`Recurso ID ${idToRemove} não encontrado na sala ${roomId} para remoção.`);
        }
    });

    room.resourceIds = modifiedIds;
    room.updatedById = idCreator;
    
    await this.roomsRepository.save(room);
    return this.findOne(roomId);
  }

  async findOneSimple(id: number): Promise<Room> {
    const room = await this.roomsRepository.findOne({
       where: { id:id, status: In([RoomStatus.AVAILABLE, RoomStatus.MAINTENANCE]) }
      });
    if (!room) {
      throw new NotFoundException(`Sala com ID ${id} não encontrada ou está desativada.`);
    }
    return room;
  }
}