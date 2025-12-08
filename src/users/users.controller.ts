import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Inject} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator'; 
import { RolesGuard } from '../auth/roles.guard'; 
import { Role } from './enums/role.enum'; // Importar Role
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { ClientProxy } from '@nestjs/microservices';


interface RequestWithUser extends Request {
  user: {
    userId: number;
    email: string;
    role: Role;
  };
}

@ApiTags('users')
@ApiBearerAuth() // Indica que as rotas podem precisar de token
@UseGuards(JwtAuthGuard) // Aplica JWT protection by default
@Controller('users')
export class UsersController {
  constructor(
      @Inject('USERS_SERVICE') private readonly client: ClientProxy
    ) {}
  
  @Public()
  @Post()
  @ApiOperation({ summary: 'Cria um novo usuário' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.client.send({ cmd: 'create_user' },
      createUserDto,
    ); 
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Lista todos os usuários' })
  @ApiResponse({ status: 200, description: 'A lista de usuários foi retornada com sucesso.', type: [User] })
  findAll() {
    return this.client.send({ cmd: 'find_all_users' }, {});
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Busca um usuário pelo ID' })
  @ApiResponse({ status: 200, description: 'O usuário foi retornado com sucesso.', type: User })
  findOne(@Param('id') id: string) {
    return this.client.send({ cmd: 'find_one_user' }, id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN) 
  @UseGuards(RolesGuard) 
  @ApiOperation({ summary: 'Atualiza um usuário (Apenas Admins)' })
  @ApiResponse({ status: 200, description: 'O usuário foi atualizado com sucesso.', type: User })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: RequestWithUser) {
    return this.client.send({ cmd: 'update_user' }, { 
      id: parseInt(id),
      dto: updateUserDto,
      adminId: req.user.userId 
    });
  }

  @Delete(':id')
  @Roles(Role.ADMIN) 
  @UseGuards(RolesGuard) 
  @ApiOperation({ summary: 'Remove um usuário (Apenas Admins)' })
  @ApiResponse({ status: 200, description: 'O usuário foi removido com sucesso.' })
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.client.send({ cmd: 'remove_user' }, { 
      id: id, 
      adminId: req.user.userId 
    }); // Passa o ID do admin para auditoria
  }
}