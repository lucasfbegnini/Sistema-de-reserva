import { Module } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { ResourcesController } from './resources.controller';
import { TypeOrmModule } from '@nestjs/typeorm'; // Importe
import { Resource } from './entities/resource.entity'; // Importe

@Module({
  imports: [TypeOrmModule.forFeature([Resource])], // Registre a entidade
  controllers: [ResourcesController],
  providers: [ResourcesService],
  exports: [ResourcesService], // Exportar o serviço pode ser útil depois
})
export class ResourcesModule {}