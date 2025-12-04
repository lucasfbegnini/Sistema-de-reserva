import { Injectable, OnApplicationBootstrap, Logger, NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt'; 
import { ConfigService } from '@nestjs/config';
import { Role } from './enums/role.enum';

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedAdminUser();
  }

  private async seedAdminUser() {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');
    const adminName = this.configService.get<string>('ADMIN_NAME');

    if (!adminEmail || !adminPassword || !adminName) {
      this.logger.warn(
        'Variáveis de ambiente do admin (ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME) não estão definidas. Pulando a criação do admin padrão.',
      );
      return;
    }

    const existingAdmin = await this.usersRepository.findOneBy({
      email: adminEmail,
    });

    if (!existingAdmin) {
      this.logger.log('Criando usuário admin padrão...');
      
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const adminUser = this.usersRepository.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: Role.ADMIN, // Definir o papel como ADMIN
      });

      await this.usersRepository.save(adminUser);
      this.logger.log('Usuário admin padrão criado com sucesso.');
    } else {
      this.logger.log('Usuário admin padrão já existe.');
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword
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
        throw new RpcException(`User with ID ${id} not found or is deleted.`);
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