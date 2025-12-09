import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { RoomStatus } from '../entities/room.entity'; // Importe o Enum de Status

export class UpdateRoomDto {
  @ApiPropertyOptional({ example: 'Sala de Reunião Principal', description: 'Novo nome da sala' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Bloco B, Térreo', description: 'Nova localização da sala' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ example: 12, description: 'Nova capacidade máxima' })
  @IsInt({ message: 'A capacidade deve ser um número inteiro.' })
  @IsPositive({ message: 'A capacidade deve ser um número positivo.' })
  @Min(1, { message: 'A capacidade mínima é 1.' })
  @IsOptional()
  capacity?: number;

  @ApiPropertyOptional({
    enum: RoomStatus,
    example: RoomStatus.MAINTENANCE,
    description: 'Novo status da sala',
  })
  @IsEnum(RoomStatus, { message: 'Status inválido.' })
  @IsOptional()
  status?: RoomStatus;
}