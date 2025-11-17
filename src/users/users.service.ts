import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
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
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
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

  findOne(id: number): Promise<User> {
    return this.usersRepository.findOneBy({ id });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOneBy({ email });
  }
}