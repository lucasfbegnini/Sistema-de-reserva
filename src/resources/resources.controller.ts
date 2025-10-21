import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Importar JwtAuthGuard global já protege, mas é bom declarar para Swagger
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { Resource } from './entities/resource.entity';
import { Public } from '../auth/public.decorator'; // Importar Public

@ApiTags('resources') // Tag para Swagger
@ApiBearerAuth() // Indica que as rotas podem precisar de token
@UseGuards(JwtAuthGuard, RolesGuard) // Aplica guardas no nível do controller
@Controller('v1/catalog/resources') // Prefixo da rota conforme PRD
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post()
  @Roles(Role.ADMIN) // Apenas Admins podem criar
  @ApiOperation({ summary: 'Cria um novo recurso (Admin)' })
  @ApiResponse({ status: 201, description: 'Recurso criado com sucesso.', type: Resource })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado (perfil incorreto).' })
  create(@Body() createResourceDto: CreateResourceDto) {
    return this.resourcesService.create(createResourceDto);
  }

  @Public() // Marcar a listagem como pública
  @Get()
  @ApiOperation({ summary: 'Lista todos os recursos disponíveis' })
  @ApiResponse({ status: 200, description: 'Lista de recursos retornada.', type: [Resource] })
  findAll() {
    return this.resourcesService.findAll();
  }

  @Public() // Marcar a busca individual como pública também
  @Get(':id')
  @ApiOperation({ summary: 'Busca um recurso pelo ID' })
  @ApiResponse({ status: 200, description: 'Recurso retornado.', type: Resource })
  @ApiResponse({ status: 404, description: 'Recurso não encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    // ParseIntPipe converte e valida se o ID é um número
    return this.resourcesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN) // Apenas Admins podem atualizar
  @ApiOperation({ summary: 'Atualiza um recurso existente (Admin)' })
  @ApiResponse({ status: 200, description: 'Recurso atualizado com sucesso.', type: Resource })
  @ApiResponse({ status: 404, description: 'Recurso não encontrado.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateResourceDto: UpdateResourceDto) {
    return this.resourcesService.update(id, updateResourceDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN) // Apenas Admins podem deletar
  @HttpCode(HttpStatus.NO_CONTENT) // Retorna 204 em vez de 200
  @ApiOperation({ summary: 'Remove um recurso (Admin)' })
  @ApiResponse({ status: 204, description: 'Recurso removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Recurso não encontrado.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.resourcesService.remove(id);
  }
}