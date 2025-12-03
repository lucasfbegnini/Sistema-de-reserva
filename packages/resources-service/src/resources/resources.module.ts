import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcesService } from './resources.service';
import { ResourcesController } from './resources.controller';
import { Resource } from './entities/resource.entity';
import { Room } from '../rooms/entities/room.entity'; // Importa a entidade Room para o contexto

@Module({
  // Registra Resource e Room para criar as tabelas e a relação ManyToMany
  imports: [TypeOrmModule.forFeature([Resource, Room])],
  controllers: [ResourcesController],
  providers: [ResourcesService],
  exports: [ResourcesService],
})
export class ResourcesModule {}