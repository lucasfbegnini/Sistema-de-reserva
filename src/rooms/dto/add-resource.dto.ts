import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class AddResourceDto {
  @ApiProperty({ 
    example: [1, 2, 5], 
    description: 'Lista de IDs dos recursos a serem vinculados a esta sala.',
    type: [Number]
  })
  @IsArray({ message: 'resourceIds deve ser uma lista de números.' })
  @IsInt({ each: true, message: 'Cada ID deve ser um número inteiro.' })
  @IsPositive({ each: true, message: 'Cada ID deve ser um número positivo.' })
  @IsNotEmpty()
  resourceIds: number[];
}