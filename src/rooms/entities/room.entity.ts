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

  // Relação Many-to-Many com Resource
  @ManyToMany(() => Resource, (resource) => resource.rooms, {
    cascade: false, // Não deletar recursos se a sala for deletada
  })
  @JoinTable({
    name: 'room_resource', // Nome da tabela de junção
    joinColumn: { name: 'roomId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'resourceId', referencedColumnName: 'id' },
  })
  @ApiProperty({ type: () => [Resource], description: 'Recursos disponíveis na sala' })
  resources: Resource[]; // Uma sala pode ter vários recursos

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updatedAt: Date;
}