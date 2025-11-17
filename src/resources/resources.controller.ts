import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/enums/role.enum'; // Importar Role
import { Resource } from './entities/resource.entity';
import { Public } from '../auth/public.decorator';
import { Request } from 'express';

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
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Cria um novo recurso (Admin)' })
  @ApiResponse({ status: 201, description: 'Recurso criado com sucesso.', type: Resource })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado (perfil incorreto).' })
  create(@Body() createResourceDto: CreateResourceDto, @Req() req: RequestWithUser) {
    return this.resourcesService.create(createResourceDto, req.user.userId);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Lista todos os recursos disponíveis' })
  @ApiResponse({ status: 200, description: 'Lista de recursos retornada.', type: [Resource] })
  findAll() {
    return this.resourcesService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Busca um recurso pelo ID' })
  @ApiResponse({ status: 200, description: 'Recurso retornado.', type: Resource })
  @ApiResponse({ status: 404, description: 'Recurso não encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.resourcesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Atualiza um recurso existente (Admin)' })
  @ApiResponse({ status: 200, description: 'Recurso atualizado com sucesso.', type: Resource })
  @ApiResponse({ status: 404, description: 'Recurso não encontrado.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateResourceDto: UpdateResourceDto, @Req() req: RequestWithUser) {
    return this.resourcesService.update(id, updateResourceDto, req.user.userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um recurso (Admin)' })
  @ApiResponse({ status: 204, description: 'Recurso removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Recurso não encontrado.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.resourcesService.remove(id, req.user.userId);
  }
}