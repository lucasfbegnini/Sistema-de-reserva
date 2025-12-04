import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  PENDING = 'PENDING',
}

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.CONFIRMED,
  })
  status: BookingStatus;

  @Column()
  userId: number;

  @Column()
  roomId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}