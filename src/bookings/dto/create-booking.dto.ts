// src/bookings/dto/create-booking.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt, IsNotEmpty, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @ApiProperty({ example: 1, description: 'ID da sala a ser reservada' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  roomId: number;

  @ApiProperty({
    example: '2025-12-25T14:00:00.000Z',
    description: 'Data e hora de início',
  })
  @IsDate()
  @Type(() => Date) // Transforma a string de entrada em um objeto Date
  @IsNotEmpty()
  startTime: Date;

  @ApiProperty({
    example: '2025-12-25T16:00:00.000Z',
    description: 'Data e hora de término',
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  // @IsDateAfter('startTime') // Você pode adicionar isso com um validador customizado
  endTime: Date;
}