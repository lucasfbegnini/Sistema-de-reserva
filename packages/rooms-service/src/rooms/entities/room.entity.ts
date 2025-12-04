import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  MAINTENANCE = 'MAINTENANCE',
  DEACTIVATED = 'DEACTIVATED', // Para soft delete
}

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty({ example: 'Sala de Brainstorm', description: 'Nome da sala' })
  name: string;

  @Column()
  @ApiProperty({ example: 'Bloco A, 2º Andar', description: 'Localização da sala' })
  location: string;

  @Column()
  @ApiProperty({ example: 10, description: 'Capacidade máxima de pessoas' })
  capacity: number;

  @Column({
    type: 'simple-enum',
    enum: RoomStatus,
    default: RoomStatus.AVAILABLE,
  })
  @ApiProperty({ enum: RoomStatus, default: RoomStatus.AVAILABLE })
  status: RoomStatus;

  @Column('int', { array: true, default: []})
  @ApiProperty({ type: [Number], description: 'IDs dos recursos associados à sala' })
  resourceIds: number[];

  // Auditoria: ID do usuário que criou a sala
  @Column({ nullable: true })
  @ApiProperty({ description: 'ID do usuário que criou a sala' })
  createdById: number;

  // Auditoria: ID do último usuário que atualizou a sala
  @Column({ nullable: true })
  @ApiProperty({ description: 'ID do usuário que atualizou a sala' })
  updatedById: number;

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updatedAt: Date;
}