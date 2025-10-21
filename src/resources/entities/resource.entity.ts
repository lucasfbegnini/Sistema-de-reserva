import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Room } from '../../rooms/entities/room.entity'; // Importe a entidade Room

export enum ResourceType {
  PROJECTOR = 'PROJECTOR',
  WEBCAM = 'WEBCAM',
  WHITEBOARD = 'WHITEBOARD',
  TV = 'TV',
  OTHER = 'OTHER',
}

@Entity()
export class Resource {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty({ example: 'Projetor Dell 4K', description: 'Nome do recurso' })
  name: string;

  @Column({
    type: 'simple-enum',
    enum: ResourceType,
  })
  @ApiProperty({ enum: ResourceType, example: ResourceType.PROJECTOR })
  type: ResourceType;

  // Relação Many-to-Many com Room (inverso)
  @ManyToMany(() => Room, (room) => room.resources)
  rooms: Room[]; // Um recurso pode estar em várias salas

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updatedAt: Date;
}