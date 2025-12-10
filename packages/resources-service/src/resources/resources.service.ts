import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Resource } from './entities/resource.entity';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(Resource)
    private resourcesRepository: Repository<Resource>,
  ) {}
x
  create(createResourceDto: CreateResourceDto, idCreator: number): Promise<Resource> {
    const resource = this.resourcesRepository.create({
        ...createResourceDto,
        createdById: idCreator,
        updatedById: idCreator,
    });
    return this.resourcesRepository.save(resource);
  }

  findAll(): Promise<Resource[]> {
    return this.resourcesRepository.find();
  }

  async findOne(id: number): Promise<Resource> {
    const resource = await this.resourcesRepository.findOneBy({ id });
    if (!resource) {
      throw new NotFoundException(`Recurso com ID ${id} não encontrado ou está deletado.`);
    }
    return resource;
  }

  async findByIds(ids: number[]): Promise<Resource[]> {
    if (!ids || ids.length === 0) {
      return [];
    }
    
    // 1. Garante que buscamos apenas IDs únicas no banco de dados
    const uniqueIds = Array.from(new Set(ids));

    // 2. Busca apenas os recursos únicos do BD (como você já fazia)
    const uniqueResources = await this.resourcesRepository.find({
      where: {
        id: In(uniqueIds), 
      },
    });

    // 3. Cria um mapa {id -> Resource} para busca rápida O(1)
    const resourceMap = new Map<number, Resource>();
    uniqueResources.forEach(resource => {
      resourceMap.set(resource.id, resource);
    });

    // 4. Mapeia a lista original de IDs para os objetos Resource correspondentes
    const resourcesWithDuplicates = ids
      .map(id => resourceMap.get(id))
      .filter(resource => resource !== undefined) as Resource[]; // Filtra IDs que não foram encontradas (opcional)

    return resourcesWithDuplicates;
  }

  async update(id: number, updateResourceDto: UpdateResourceDto, idCreator: number): Promise<Resource> {
    const resource = await this.findOne(id);
    
    // Usa TypeORM.merge para garantir que updatedById seja reconhecido.
    this.resourcesRepository.merge(resource, updateResourceDto, { updatedById: idCreator });
    
    return this.resourcesRepository.save(resource);
  }

  async remove(id: number, idCreator: number): Promise<any> {
    const resource = await this.findOne(id);

    // 1. Auditoria: Marca quem está "deletando" (soft delete)
    resource.updatedById = idCreator;
    await this.resourcesRepository.save(resource);

    // 2. Soft Delete
    const result = await this.resourcesRepository.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Recurso com ID ${id} não encontrado.`);
    }
    return { success: true };
  }

  async alocarRecursoASala(resourceId: number, roomId: number, idCreator: number): Promise<any> {
    const resource = await this.findOne(resourceId);
    if (!resource) {
        throw new NotFoundException(`Recurso com ID ${resourceId} não encontrado.`);
    }
    const currentRooms = resource.rooms || [];

    // Adiciona a sala se não estiver presente
    if (!currentRooms.includes(roomId)) {
      resource.rooms = [...currentRooms, roomId];
      resource.updatedById = idCreator;
      await this.resourcesRepository.save(resource);
    }
    return { success: true };
  }

  async removerRecursoDaSala(resourceId: number, roomId: number, idCreator: number): Promise<any> {
    const resource = await this.findOne(resourceId);
    if (!resource) {
        throw new NotFoundException(`Recurso com ID ${resourceId} não encontrado.`);
    }
    const currentRooms = resource.rooms || [];
    // Remove a sala se estiver presente
    if (currentRooms.includes(roomId)) {
      resource.rooms = currentRooms.filter(id => id !== roomId);
      resource.updatedById = idCreator;
      await this.resourcesRepository.save(resource);
    }
    return { success: true };
  }
}