import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { Resource } from './entities/resource.entity';

@Controller()
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @MessagePattern({ cmd: 'create_resource' })
  create(@Payload() data: { createResourceDto: CreateResourceDto, idCreator: number }) {
    return this.resourcesService.create(data.createResourceDto, data.idCreator);
  }

  @MessagePattern({ cmd: 'find_all_resources' })
  findAll() {
    return this.resourcesService.findAll();
  }

  @MessagePattern({ cmd: 'find_one_resource' })
  findOne(@Payload() id: number) {
    return this.resourcesService.findOne(id);
  }

  @MessagePattern('find_resources_by_ids')
  async findByIds(@Payload() ids: number[]): Promise<Resource[]> {
    return this.resourcesService.findByIds(ids);
  }

  @MessagePattern({ cmd: 'update_resource' })
  update(@Payload() data: { id: number, updateResourceDto: UpdateResourceDto, userId: number }) {
    return this.resourcesService.update(data.id, data.updateResourceDto, data.userId);
  }

  @MessagePattern({ cmd: 'remove_resource' })
  remove(@Payload() data: { id: number, userId: number }) {
    return this.resourcesService.remove(data.id, data.userId);
  }
}