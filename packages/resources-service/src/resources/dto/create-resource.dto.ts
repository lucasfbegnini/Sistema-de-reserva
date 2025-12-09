import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ResourceType } from '../entities/resource.entity'; // Importe o Enum

export class CreateResourceDto {
  @ApiProperty({ example: 'Projetor Dell 4K', description: 'Nome do recurso' })
  @IsString()
  @IsNotEmpty({ message: 'O nome do recurso não pode ser vazio.' })
  name: string;

  @ApiProperty({
    enum: ResourceType,
    example: ResourceType.PROJECTOR,
    description: 'Tipo do recurso',
  })
  @IsEnum(ResourceType, { message: 'Tipo de recurso inválido.' })
  @IsNotEmpty({ message: 'O tipo do recurso não pode ser vazio.' })
  type: ResourceType;
}