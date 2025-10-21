import { Injectable, NotFoundException } from '@nestjs/common'; // Adicionado NotFoundException
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

  async create(createUserDto: CreateUserDto): Promise<User> { // 2. Transforme em um método assíncrono
    // 3. Criptografe a senha
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10); // O "10" é o custo do hash

    // 4. Crie o usuário com a senha criptografada
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    
    return this.usersRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado(a).`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id); // Garante que o usuário existe
    this.usersRepository.merge(user, updateUserDto);
    return this.usersRepository.save(user);

    // await this.usersRepository.update(id, updateUserDto);
    // return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
        throw new NotFoundException(`Usuário com ID ${id} não encontrado(a).`);
    }
  }

  findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOneBy({ email });
  }
}