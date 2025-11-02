// src/bookings/entities/booking.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
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

  @ManyToOne(() => User, { eager: true }) // eager: true carrega o usuário automaticamente
  @ApiProperty({ type: () => User, description: 'Usuário que fez a reserva' })
  user: User;

  @ManyToOne(() => Room, { eager: true }) // eager: true carrega a sala automaticamente
  @ApiProperty({ type: () => Room, description: 'Sala reservada' })
  room: Room;

  @Column()
  @ApiProperty({ description: 'Data e hora de início da reserva' })
  startTime: Date;

  @Column()
  @ApiProperty({ description: 'Data e hora de término da reserva' })
  endTime: Date;

  @Column({
    type: 'simple-enum',
    enum: BookingStatus,
    default: BookingStatus.CONFIRMED,
  })
  @ApiProperty({ enum: BookingStatus, default: BookingStatus.CONFIRMED })
  status: BookingStatus;

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updatedAt: Date;
}