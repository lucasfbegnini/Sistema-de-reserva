import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

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

  @Column('int', { array: true, default: []})
  @ApiProperty({ type: [Number], description: 'Sala associadas ao recurso' })
  rooms: number[]; // Um recurso pode estar em várias salas

  @Column({ nullable: true })
  @ApiProperty({ description: 'ID do usuário que criou o recurso' })
  createdById: number;

  @Column({ nullable: true })
  @ApiProperty({ description: 'ID do usuário que atualizou o recurso' })
  updatedById: number;

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updatedAt: Date;

  @DeleteDateColumn() // Soft delete
  deletedAt: Date;
}