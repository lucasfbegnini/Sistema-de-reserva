import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Role } from '../enums/role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty({ example: 'John Doe', description: 'O nome do usuário' })
  name: string;

  @Column({ unique: true })
  @ApiProperty({ example: 'john.doe@example.com', description: 'O e-mail do usuário' })
  email: string;

  @Column()
  @Exclude() 
  password: string;

  @Column({
    type: 'simple-enum',
    enum: Role,
    default: Role.USER, 
  })
  @ApiProperty({ enum: Role, default: Role.USER })
  role: Role;
  
  @Column({ nullable: true })
  @Exclude() // Auditoria
  createdById: number;

  @Column({ nullable: true })
  @Exclude() // Auditoria
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