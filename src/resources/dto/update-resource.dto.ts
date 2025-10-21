import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ResourceType } from '../entities/resource.entity';

export class UpdateResourceDto {
  @ApiPropertyOptional({ example: 'Projetor Epson HD', description: 'Novo nome do recurso' })
  @IsString()
  @IsOptional() // Marcar como opcional para PATCH
  name?: string;

  @ApiPropertyOptional({
    enum: ResourceType,
    example: ResourceType.PROJECTOR,
    description: 'Novo tipo do recurso',
  })
  @IsEnum(ResourceType, { message: 'Tipo de recurso inválido.' })
  @IsOptional()
  type?: ResourceType;
}