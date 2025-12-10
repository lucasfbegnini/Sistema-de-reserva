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
  async findResourcesAllocated(resourceId: number): Promise<number[]> {
    const resources: any[] = await this.resourcesClient.send(
      'find_resources_by_ids',
      [resourceId],
    ).toPromise();

    const resource = resources[0];
    return (resource && resource.rooms) ? resource.rooms : [];
  }
  async adicionarRecursoASala(roomId: number, resourceId: number, idCreator: number): Promise<any> {
    await this.resourcesClient.send(
      { cmd: 'allocate_resource_to_room' }, 
      { 
        resourceId: resourceId, 
        roomId: roomId, 
        idCreator: idCreator 
      }
    ).toPromise();

    return { success: true };
  }
  async removerRecursoDaSala(roomId: number, resourceId: number, idCreator: number): Promise<any> {
    return this.resourcesClient.send(
        { cmd: 'deallocate_from_room' }, // Exemplo de comando
        { resourceId, roomId, idCreator }
    ).toPromise();
  }

  async addResources(roomId: number, resourceIdToAdd: number, idCreator: number) {
    //ver se recuso ja esta alocado
    const allocatedRoomIds = await this.findResourcesAllocated(resourceIdToAdd);
    if(allocatedRoomIds.length>0){
      if(allocatedRoomIds.includes(roomId)){
        this.logger.warn(`Recurso ${resourceIdToAdd} já está na alocação.`);
      }else{
        throw new BadRequestException(
                `Recurso com ID ${resourceIdToAdd} já está alocado à(s) sala(s) ID(s): [${allocatedRoomIds.join(', ')}].`
            );
      }
    }
    await this.adicionarRecursoASala(roomId, resourceIdToAdd, idCreator);

    const room = await this.findOneSimple(roomId); 
    // Inicializa se for null
    const currentIds = room.resourceIds || [];

    room.resourceIds = [...currentIds, resourceIdToAdd];

    room.updatedById = idCreator;
    await this.roomsRepository.save(room);
    return this.findOne(roomId);
  }

  async removeResources(roomId: number, resourceIdToRemove: number, idCreator: number) {
    //ver se recuso ja esta alocado
    const allocatedRoomIds = await this.findResourcesAllocated(resourceIdToRemove);
    //n esta na sala atual
    if (!allocatedRoomIds.includes(roomId)) {
        //recurso n alocado em nenhuma sala
        if (allocatedRoomIds.length === 0) {
            throw new NotFoundException(
                `Recurso com ID ${resourceIdToRemove} não está associado a nenhuma sala (incluindo Sala ${roomId}).`
            );
        } else {
            // Se está alocado em outro lugar, mas o usuário tenta remover daqui.
            throw new BadRequestException(
                `Recurso ID ${resourceIdToRemove} está alocado à(s) outra(s) sala(s) ID(s): [${allocatedRoomIds.join(', ')}], mas não à Sala ${roomId}.`
            );
        }
    }
    await this.removerRecursoDaSala(roomId, resourceIdToRemove, idCreator);

    const room = await this.findOneSimple(roomId); 
    
    let currentIds = room.resourceIds || [];
    
    // Criamos uma cópia para modificação
    let modifiedIds = [...currentIds]; 

    const index = modifiedIds.indexOf(resourceIdToRemove);
    if (index !== -1) {
      modifiedIds.splice(index, 1); // remove só o primeiro encontrado
    }

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