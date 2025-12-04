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
import { Resource } from 'src/resources/entities/resource.entity'; // Importe a entidade Resource

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  MAINTENANCE = 'MAINTENANCE',
  DEACTIVATED = 'DEACTIVATED', // Para soft delete
}

@Entity()
export class Room {
  @ApiProperty()
  id: number;

  @ApiProperty({ example: 'Sala de Brainstorm', description: 'Nome da sala' })
  name: string;

  @ApiProperty({ example: 'Bloco A, 2º Andar', description: 'Localização da sala' })
  location: string;

  @ApiProperty({ example: 10, description: 'Capacidade máxima de pessoas' })
  capacity: number;

  @ApiProperty({ enum: RoomStatus, default: RoomStatus.AVAILABLE })
  status: RoomStatus;

  @ApiProperty({ type: () => [Resource], description: 'Recursos disponíveis na sala' })
  resources: Resource[]; // Uma sala pode ter vários recursos

  @ApiProperty({ description: 'ID do usuário que criou a sala' })
  createdById: number;

  @ApiProperty({ description: 'ID do usuário que atualizou a sala' })
  updatedById: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}