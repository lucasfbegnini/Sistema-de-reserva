import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, UseGuards, ParseIntPipe, Req, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
// DTOs (Mantidos na raiz para validação de entrada)
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
// Segurança e Entidades (Mantidas para Swagger e Auth)
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { Public } from '../auth/public.decorator';
import { Room } from './entities/room.entity';

// Interface para estender o Request do Express e incluir nosso usuário
interface RequestWithUser extends Request {
  user: {
    userId: number;
    email: string;
    role: Role; // CORRIGIDO: Tipo Role importado de enums
  };
}

@ApiTags('rooms') // Tag Swagger para agrupar endpoints de salas
@ApiBearerAuth() // Indica que a autenticação Bearer (JWT) pode ser necessária
@UseGuards(JwtAuthGuard, RolesGuard) // Aplica os guardas globalmente neste controller
@Controller('v1/catalog/rooms') // Prefixo da rota conforme PRD
export class RoomsController {
  
  private readonly logger = new Logger(RoomsController.name);
  constructor(
    @Inject('ROOMS_SERVICE') private readonly client: ClientProxy
  ) {}

  // --- CRUD de Salas ---

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Cria uma nova sala (Admin)' })
  @ApiResponse({ status: 201, description: 'Sala criada com sucesso.', type: Room })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado (perfil incorreto).' })
  create(@Body() createRoomDto: CreateRoomDto, @Req() req: RequestWithUser) {
    return this.client.send({ cmd: 'create_room' }, { 
      dto: createRoomDto, 
      idCreator: req.user.userId 
    });
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Lista todas as salas' })
  @ApiResponse({ status: 200, description: 'Lista de salas retornada.', type: [Room] })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  findAll() {
    return this.client.send({ cmd: 'find_all_rooms' }, {});
  }

  @Public() // Endpoint público
  @Get(':id')
  @ApiOperation({ summary: 'Busca uma sala pelo ID' })
  @ApiResponse({ status: 200, description: 'Sala retornada com sucesso.', type: Room })
  @ApiResponse({ status: 404, description: 'Sala não encontrada ou desativada.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.client.send({ cmd: 'find_one_room' }, { id: id });
  }

  @Patch(':id')
  @Roles(Role.ADMIN) // Apenas Admins podem atualizar
  @ApiOperation({ summary: 'Atualiza uma sala existente (Admin)' })
  @ApiResponse({ status: 200, description: 'Sala atualizada com sucesso.', type: Room })
  @ApiResponse({ status: 404, description: 'Sala não encontrada.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateRoomDto: UpdateRoomDto, @Req() req: RequestWithUser) {
    return this.client.send({ cmd: 'update_room' }, { 
      id: id, 
      dto: updateRoomDto, 
      idCreator: req.user.userId 
    });
  }

  @Delete(':id')
  @Roles(Role.ADMIN) // Apenas Admins podem desativar (soft delete)
  @ApiOperation({ summary: 'Desativa uma sala (Soft Delete - Admin)' })
  @ApiResponse({ status: 204, description: 'Sala desativada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Sala não encontrada.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.client.send({ cmd: 'remove_room' }, { 
      id, 
      idCreator: req.user.userId 
    });
  }

  // --- Associação Sala-Recurso ---

  @Post(':id/resources/:resourceId')
  @Roles(Role.ADMIN) // Apenas Admins podem associar recursos
  @ApiOperation({ summary: 'Associa um recurso a uma sala (Admin)' })
  @ApiResponse({ status: 201, description: 'Recurso associado com sucesso.', type: Room })
  @ApiResponse({ status: 404, description: 'Sala ou Recurso não encontrado.' })
  @ApiResponse({ status: 400, description: 'Recurso já associado a esta sala.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  addResource(@Param('id', ParseIntPipe) id: number, @Param('resourceId', ParseIntPipe) resourceId: number, @Req() req: RequestWithUser) {
    return this.client.send({ cmd: 'add_resource_to_room' }, { 
      id,
      resourceId: resourceId,
      idCreator: req.user.userId
    });
  }

  @Delete(':id/resources/:resourceId')
  @Roles(Role.ADMIN) // Apenas Admins podem desassociar recursos
  @ApiOperation({ summary: 'Desassocia um recurso de uma sala (Admin)' })
  @ApiResponse({ status: 204, description: 'Recurso desassociado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Sala ou Recurso não encontrado na associação.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  removeResource(
    @Param('id', ParseIntPipe) roomId: number,
    @Param('resourceId', ParseIntPipe) resourceId: number,
    @Req() req: RequestWithUser,
  ) {
    return this.client.send({ cmd: 'remove_resource_from_room' }, { 
      roomId, 
      resourceId, 
      idCreator: req.user.userId 
    });
  }
}