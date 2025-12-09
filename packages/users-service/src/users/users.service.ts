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

  async create(createUserDto: CreateUserDto, adminId: number): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const existenteUser = await this.findByEmail(createUserDto.email);
    if (existenteUser) {
      this.logger.log('Usuário ja existe.');
      if(existenteUser.deletedAt){
        await this.usersRepository.restore(existenteUser.id);
            
            // 2. Atualiza dados (senha e auditoria)
            await this.usersRepository.update(existenteUser.id, {
                password: hashedPassword, // Atualiza a senha (se o DTO tiver)
                updatedById: adminId,
            });

            // 3. RECARRREGA o usuário para ter o objeto atualizado (deletedAt = null)
            const restoredUser = await this.usersRepository.findOne({ 
                where: { id: existenteUser.id } 
            });

            this.logger.log(`Usuário ${restoredUser.email} restaurado e atualizado por ID ${adminId}.`);
            return restoredUser; // FINALIZA O FLUXO AQUI.
      }else{
        throw new RpcException('erro ao criar usuário: email já em uso');
      }
    }

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      createdById: adminId,
      updatedById: adminId,
    });
    return this.usersRepository.save(user);
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
    if(updateUserDto.name === '' || updateUserDto.name === undefined){
      updateUserDto.name = user.name;
    }
    if(updateUserDto.email === '' || updateUserDto.email === undefined){
      updateUserDto.email = user.email;
    }
    const userEmail = await this.findByEmail(updateUserDto.email);
    if(userEmail && userEmail.id !== user.id){
      throw new RpcException('erro ao atualizar usuário: email já em uso');
    }
    
    const updatedUser = {
      ...updateUserDto,
      updatedById: adminId,
    };
    this.usersRepository.merge(user, updatedUser);
    
    return this.usersRepository.save(user);
  }

  async remove(id: number, adminId: number): Promise<String> {
    const user = await this.findOne(id);
    if (!user) {
        throw new RpcException(
            new NotFoundException(`usuario não encotrado ou já removido.`)
        );
    }

    // 1. Auditoria: Seta o ID do usuário que está deletando
    await this.usersRepository.update(id, {
        updatedById: adminId,
    } as any);

    // 2. Soft Delete
    const result = await this.usersRepository.softDelete(id);
    if (result.affected === 0) {
        throw new RpcException(
            new NotFoundException(`User with ID ${id} not found.`)
        );
    }
    const msg = {id: id, message: `Usuário com ID ${id} removido com sucesso.`};
    this.logger.log(msg.message);
    return msg.message;
  }

  // users.service.ts

async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
        where: { email },
        withDeleted: true, 
    });
}
}