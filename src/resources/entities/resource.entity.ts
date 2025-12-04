import { ApiProperty } from '@nestjs/swagger';
import { Room } from '../../rooms/entities/room.entity';

export enum ResourceType {
  PROJECTOR = 'PROJECTOR',
  WEBCAM = 'WEBCAM',
  WHITEBOARD = 'WHITEBOARD',
  TV = 'TV',
  OTHER = 'OTHER',
}

export class Resource {
  @ApiProperty()
  id: number;

  @ApiProperty({ example: 'Projetor Dell 4K', description: 'Nome do recurso' })
  name: string;

  @ApiProperty({ enum: ResourceType, example: ResourceType.PROJECTOR })
  type: ResourceType;

  rooms: Room[]; 

  @ApiProperty({ description: 'ID do usuário que criou o recurso' })
  createdById: number;

  @ApiProperty({ description: 'ID do usuário que atualizou o recurso' })
  updatedById: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  deletedAt: Date;
}