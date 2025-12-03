import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from './entities/resource.entity';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(Resource)
    private resourcesRepository: Repository<Resource>,
  ) {}

  create(createResourceDto: CreateResourceDto, userId: number): Promise<Resource> {
    const resource = this.resourcesRepository.create({
        ...createResourceDto,
        createdById: userId,
        updatedById: userId,
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

  async update(id: number, updateResourceDto: UpdateResourceDto, userId: number): Promise<Resource> {
    const resource = await this.findOne(id);
    
    // Usa TypeORM.merge para garantir que updatedById seja reconhecido.
    this.resourcesRepository.merge(resource, updateResourceDto, { updatedById: userId });
    
    return this.resourcesRepository.save(resource);
  }

  async remove(id: number, userId: number): Promise<void> {
    const resource = await this.findOne(id);

    // 1. Auditoria: Marca quem está "deletando" (soft delete)
    resource.updatedById = userId;
    await this.resourcesRepository.save(resource);

    // 2. Soft Delete
    const result = await this.resourcesRepository.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Recurso com ID ${id} não encontrado.`);
    }
  }
}