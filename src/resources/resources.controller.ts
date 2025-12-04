import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, Req, Inject} from '@nestjs/common';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { Public } from '../auth/public.decorator';
import { Request } from 'express';
import { ClientProxy } from '@nestjs/microservices';

// Interface para estender o Request do Express e incluir nosso usuário
interface RequestWithUser extends Request {
  user: {
    userId: number;
    email: string;
    role: Role; // CORRIGIDO: Tipo Role importado de enums
  };
}

@ApiTags('resources')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/catalog/resources')
export class ResourcesController {
  constructor(
    @Inject('RESOURCES_SERVICE') private readonly client: ClientProxy
  ) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Cria um novo recurso (Admin)' })
  create(@Body() createResourceDto: CreateResourceDto, @Req() req: RequestWithUser) {
    // Manda mensagem para o microserviço
    return this.client.send({ cmd: 'create_resource' }, { 
      createResourceDto, 
      userId: req.user.userId 
    });
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Lista todos os recursos disponíveis' })
  findAll(){
    return this.client.send({ cmd: 'find_all_resources' }, {});
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Busca um recurso pelo ID' })
  findOne(id: number) {
    return this.client.send({ cmd: 'find_one_resource' }, { id });
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Atualiza um recurso existente (Admin)' })
  update(id: number, updateResourceDto: UpdateResourceDto, @Req() req: RequestWithUser) {
    return this.client.send({ cmd: 'update_resource' }, { id, updateResourceDto, userId: req.user.userId });
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um recurso (Admin)' })
  remove(id: number, @Req() req: RequestWithUser) {
    return this.client.send({ cmd: 'remove_resource' }, { id, userId: req.user.userId });
  }
}