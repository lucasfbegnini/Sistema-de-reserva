import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Role } from '../enums/role.enum';

@Entity()
export class User {
  @ApiProperty()
  id: number;

  @ApiProperty({ example: 'John Doe', description: 'O nome do usuário' })
  name: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'O e-mail do usuário' })
  email: string;

  @Exclude() 
  password: string;

  @ApiProperty({ enum: Role, default: Role.USER })
  role: Role;
  
  @Exclude() // Auditoria
  createdById: number;

  @Exclude() // Auditoria
  updatedById: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}