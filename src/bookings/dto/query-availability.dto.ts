// src/bookings/dto/query-availability.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty } from 'class-validator';

export class QueryAvailabilityDto {
  @ApiProperty({
    description: 'Data de início do período de consulta (ISO 8601)',
    example: '2025-12-25T00:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({
    description: 'Data de fim do período de consulta (ISO 8601)',
    example: '2025-12-25T23:59:59.000Z',
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  // @IsDateAfter('startDate') // Pode ser adicionado com validador customizado
  endDate: Date;
}