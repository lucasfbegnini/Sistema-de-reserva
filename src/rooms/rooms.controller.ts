import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query, // Para os query params
  ParseArrayPipe, // Para o array de resourceIds
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { AddResourceDto } from './dto/add-resource.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { Public } from '../auth/public.decorator';
import { Room } from './entities/room.entity';

@ApiTags('rooms') // Tag Swagger para agrupar endpoints de salas
@ApiBearerAuth() // Indica que a autenticação Bearer (JWT) pode ser necessária
@UseGuards(JwtAuthGuard, RolesGuard) // Aplica os guardas globalmente neste controller
@Controller('v1/catalog/rooms') // Prefixo da rota conforme PRD
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  // --- CRUD de Salas ---

  @Post()
  @Roles(Role.ADMIN) // Apenas Admins podem criar salas
  @ApiOperation({ summary: 'Cria uma nova sala (Admin)' })
  @ApiResponse({ status: 201, description: 'Sala criada com sucesso.', type: Room })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado (perfil incorreto).' })
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }

  @Public() // Endpoint público
  @Get()
  @ApiOperation({ summary: 'Lista salas com filtros opcionais' })
  @ApiQuery({ name: 'minCapacity', required: false, type: Number, description: 'Capacidade mínima desejada' })
  @ApiQuery({ name: 'resources', required: false, type: [Number], description: 'Lista de IDs de recursos que a sala deve possuir' })
  @ApiResponse({ status: 200, description: 'Lista de salas retornada.', type: [Room] })
  findAll(
    @Query('minCapacity', new ParseIntPipe({ optional: true })) minCapacity?: number,
    // ParseArrayPipe converte a query string (ex: resources=1&resources=2) em um array de números
    @Query('resources', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) resources?: number[],
  ) {
    return this.roomsService.findAll(minCapacity, resources);
  }

  @Public() // Endpoint público
  @Get(':id')
  @ApiOperation({ summary: 'Busca uma sala pelo ID' })
  @ApiResponse({ status: 200, description: 'Sala retornada com sucesso.', type: Room })
  @ApiResponse({ status: 404, description: 'Sala não encontrada ou desativada.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN) // Apenas Admins podem atualizar
  @ApiOperation({ summary: 'Atualiza uma sala existente (Admin)' })
  @ApiResponse({ status: 200, description: 'Sala atualizada com sucesso.', type: Room })
  @ApiResponse({ status: 404, description: 'Sala não encontrada.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomsService.update(id, updateRoomDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN) // Apenas Admins podem desativar (soft delete)
  @HttpCode(HttpStatus.NO_CONTENT) // Retorna 204
  @ApiOperation({ summary: 'Desativa uma sala (Soft Delete - Admin)' })
  @ApiResponse({ status: 204, description: 'Sala desativada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Sala não encontrada.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.remove(id);
  }

  // --- Associação Sala-Recurso ---

  @Post(':id/resources')
  @Roles(Role.ADMIN) // Apenas Admins podem associar recursos
  @ApiOperation({ summary: 'Associa um recurso a uma sala (Admin)' })
  @ApiResponse({ status: 201, description: 'Recurso associado com sucesso.', type: Room })
  @ApiResponse({ status: 404, description: 'Sala ou Recurso não encontrado.' })
  @ApiResponse({ status: 400, description: 'Recurso já associado a esta sala.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  addResource(
    @Param('id', ParseIntPipe) roomId: number,
    @Body() addResourceDto: AddResourceDto,
  ) {
    return this.roomsService.addResourceToRoom(roomId, addResourceDto.resourceId);
  }

  @Delete(':id/resources/:resourceId')
  @Roles(Role.ADMIN) // Apenas Admins podem desassociar recursos
  @HttpCode(HttpStatus.NO_CONTENT) // Retorna 204
  @ApiOperation({ summary: 'Desassocia um recurso de uma sala (Admin)' })
  @ApiResponse({ status: 204, description: 'Recurso desassociado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Sala ou Recurso não encontrado na associação.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  removeResource(
    @Param('id', ParseIntPipe) roomId: number,
    @Param('resourceId', ParseIntPipe) resourceId: number,
  ) {
    return this.roomsService.removeResourceFromRoom(roomId, resourceId);
  }
}