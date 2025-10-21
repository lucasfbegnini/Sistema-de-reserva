import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class AddResourceDto {
  @ApiProperty({ example: 1, description: 'ID do recurso existente a ser adicionado à sala. Obtenha IDs da listagem de recursos.' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  resourceId: number;
}