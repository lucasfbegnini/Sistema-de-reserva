import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt'; 

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    
    const savedUser = await this.usersRepository.save(user);

    // Auditoria para auto-registro (o usuário é o próprio criador)
    savedUser.createdById = savedUser.id;
    savedUser.updatedById = savedUser.id;

    return this.usersRepository.save(savedUser);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
        throw new NotFoundException(`User with ID ${id} not found or is deleted.`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto, adminId: number): Promise<User> {
    const user = await this.findOne(id);
    
    // O TypeORM.merge é seguro para incluir updatedById se a entidade estiver tipada corretamente
    this.usersRepository.merge(user, updateUserDto, { updatedById: adminId });
    
    return this.usersRepository.save(user);
  }

  async remove(id: number, adminId: number): Promise<void> {
    const user = await this.findOne(id);

    // 1. Auditoria: Seta o ID do usuário que está deletando
    user.updatedById = adminId;
    await this.usersRepository.save(user);

    // 2. Soft Delete
    const result = await this.usersRepository.softDelete(id);
     if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
  }

  findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOneBy({ email });
  }
}