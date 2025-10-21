import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class AddResourceDto {
  @ApiProperty({ example: 1, description: 'ID do recurso a ser adicionado' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  resourceId: number;
}