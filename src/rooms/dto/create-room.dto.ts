import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString, Min } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ example: 'Sala de Brainstorm', description: 'Nome da sala' })
  @IsString()
  @IsNotEmpty({ message: 'O nome da sala não pode ser vazio.' })
  name: string;

  @ApiProperty({ example: 'Bloco A, 2º Andar', description: 'Localização da sala' })
  @IsString()
  @IsNotEmpty({ message: 'A localização não pode ser vazia.' })
  location: string;

  @ApiProperty({ example: 10, description: 'Capacidade máxima de pessoas' })
  @IsInt({ message: 'A capacidade deve ser um número inteiro.' })
  @IsPositive({ message: 'A capacidade deve ser um número positivo.' })
  @Min(1, { message: 'A capacidade mínima é 1.' })
  @IsNotEmpty({ message: 'A capacidade não pode ser vazia.' })
  capacity: number;
}