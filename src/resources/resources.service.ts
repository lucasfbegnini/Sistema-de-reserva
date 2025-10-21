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

  create(createResourceDto: CreateResourceDto): Promise<Resource> {
    const resource = this.resourcesRepository.create(createResourceDto);
    return this.resourcesRepository.save(resource);
  }

  findAll(): Promise<Resource[]> {
    return this.resourcesRepository.find();
  }

  async findOne(id: number): Promise<Resource> {
    const resource = await this.resourcesRepository.findOneBy({ id });
    if (!resource) {
      throw new NotFoundException(`Recurso com ID ${id} não encontrado.`);
    }
    return resource;
  }

  async update(id: number, updateResourceDto: UpdateResourceDto): Promise<Resource> {
    const resource = await this.findOne(id); // Reusa findOne para checar se existe
    this.resourcesRepository.merge(resource, updateResourceDto);
    return this.resourcesRepository.save(resource);
  }

  async remove(id: number): Promise<void> {
    const result = await this.resourcesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Recurso com ID ${id} não encontrado.`);
    }
  }
}