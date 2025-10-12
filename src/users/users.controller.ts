import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator'; 
import { RolesGuard } from '../auth/roles.guard'; 
import { Role } from './enums/role.enum';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
 
  @Public()
  @Post()
  @ApiOperation({ summary: 'Cria um novo usuário' })
  @ApiResponse({ status: 201, description: 'O usuário foi criado com sucesso.', type: User })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os usuários' })
  @ApiResponse({ status: 200, description: 'A lista de usuários foi retornada com sucesso.', type: [User] })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um usuário pelo ID' })
  @ApiResponse({ status: 200, description: 'O usuário foi retornado com sucesso.', type: User })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um usuário' })
  @ApiResponse({ status: 200, description: 'O usuário foi atualizado com sucesso.', type: User })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN) 
  @UseGuards(RolesGuard) 
  @ApiOperation({ summary: 'Remove um usuário (Apenas Admins)' })
  @ApiResponse({ status: 200, description: 'O usuário foi removido com sucesso.' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}