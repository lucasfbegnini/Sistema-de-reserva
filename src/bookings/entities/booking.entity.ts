// src/bookings/entities/booking.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Room } from '../../rooms/entities/room.entity';

export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @ApiProperty({ type: () => User, description: 'Usuário que fez a reserva' })
  user: User;

  @ApiProperty({ type: () => Room, description: 'Sala reservada' })
  room: Room;

  @ApiProperty({ description: 'Data e hora de início da reserva' })
  startTime: Date;

  @ApiProperty({ description: 'Data e hora de término da reserva' })
  endTime: Date;

  @ApiProperty({ enum: BookingStatus, default: BookingStatus.CONFIRMED })
  status: BookingStatus;


  @ApiProperty({ description: 'ID do usuário que criou a reserva' })
  createdById: number;

  @ApiProperty({ description: 'ID do usuário que atualizou a reserva' })
  updatedById: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}