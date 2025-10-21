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

  create(createRoomDto: CreateRoomDto): Promise<Room> {
    // A sala começa como AVAILABLE por padrão (definido na entidade)
    const room = this.roomsRepository.create(createRoomDto);
    return this.roomsRepository.save(room);
  }

  async findAll(minCapacity?: number, resourceIds?: number[]): Promise<Room[]> {
    // Usaremos QueryBuilder para filtros mais complexos
    const queryBuilder: SelectQueryBuilder<Room> = this.roomsRepository.createQueryBuilder('room')
      .leftJoinAndSelect('room.resources', 'resource') // Carregar os recursos associados
      .where('room.status != :status', { status: RoomStatus.DEACTIVATED }); // Não mostrar salas desativadas

    if (minCapacity) {
      queryBuilder.andWhere('room.capacity >= :minCapacity', { minCapacity });
    }

    if (resourceIds && resourceIds.length > 0) {
      // Filtrar salas que TÊM TODOS os recursos especificados
      // Este é um filtro mais complexo. Para cada resourceId, garantimos que ele existe na sala.
      queryBuilder.andWhere(qb => {
        const subQuery = qb.subQuery()
          .select('1')
          .from('room_resource', 'rr') // Usar o nome da tabela de junção
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
       where: { id, status: In([RoomStatus.AVAILABLE, RoomStatus.MAINTENANCE]) }, // Não encontrar se desativada
       relations: ['resources'], // Carregar a relação com resources
      });
    if (!room) {
      throw new NotFoundException(`Sala com ID ${id} não encontrada ou está desativada.`);
    }
    return room;
  }

  async update(id: number, updateRoomDto: UpdateRoomDto): Promise<Room> {
    // Usar preload para carregar a entidade existente e mesclar os dados do DTO
    // Isso também dispara os hooks do TypeORM, se houver
    const room = await this.roomsRepository.preload({
      id: id,
      ...updateRoomDto,
    });
    if (!room) {
      throw new NotFoundException(`Sala com ID ${id} não encontrada.`);
    }
    // Não permitir reativar uma sala desativada por este método
    if (room.status === RoomStatus.DEACTIVATED && updateRoomDto.status !== RoomStatus.DEACTIVATED) {
        // Você pode querer um método específico para reativar, ou permitir aqui, dependendo da regra de negócio.
        // Por ora, vamos proibir para manter o soft delete simples.
        const originalRoom = await this.findOne(id); // Busca a sala original (que não deveria ser encontrada se DEACTIVATED)
        if (originalRoom.status === RoomStatus.DEACTIVATED) {
             throw new BadRequestException('Não é possível modificar uma sala desativada por este endpoint.');
        }
    }

    return this.roomsRepository.save(room);
  }

  async remove(id: number): Promise<void> {
    // Soft Delete: Apenas muda o status
    const room = await this.findOne(id); // Garante que a sala existe e não está já desativada
    room.status = RoomStatus.DEACTIVATED;
    await this.roomsRepository.save(room);
  }

  // --- Associação com Recursos ---

  async addResourceToRoom(roomId: number, resourceId: number): Promise<Room> {
    const room = await this.findOne(roomId); // Busca a sala, já carregando os recursos atuais
    const resource = await this.resourcesService.findOne(resourceId); // Busca o recurso

    // Verifica se o recurso já está na sala para evitar duplicatas
    const resourceExists = room.resources.some(res => res.id === resourceId);
    if (resourceExists) {
      // Pode retornar a sala como está ou lançar um erro, dependendo da sua regra de negócio
       throw new BadRequestException(`O recurso com ID ${resourceId} já está associado à sala com ID ${roomId}.`);
      // return room;
    }

    room.resources.push(resource);
    return this.roomsRepository.save(room);
  }

  async removeResourceFromRoom(roomId: number, resourceId: number): Promise<void> {
    const room = await this.findOne(roomId); // Busca a sala, carregando os recursos

    const resourceIndex = room.resources.findIndex(res => res.id === resourceId);
    if (resourceIndex === -1) {
      throw new NotFoundException(`Recurso com ID ${resourceId} não encontrado na sala com ID ${roomId}.`);
    }

    // Remove o recurso da lista
    room.resources.splice(resourceIndex, 1);
    await this.roomsRepository.save(room); // Salva a relação atualizada
  }
}
