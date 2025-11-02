// src/bookings/bookings.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Req,
  HttpCode,
  HttpStatus,
  Query, // 1. Importar Query
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery, // 2. Importar ApiQuery
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Request } from 'express';
import { Booking } from './entities/booking.entity';
import { Roles } from 'src/auth/roles.decorator'; // 3. Importar Roles
import { Role } from 'src/users/enums/role.enum'; // 4. Importar Role
import { QueryAvailabilityDto } from './dto/query-availability.dto'; // 5. Importar DTO

// Interface para estender o Request do Express e incluir nosso usuário
interface RequestWithUser extends Request {
  user: {
    userId: number;
    email: string;
    role: string;
  };
}

@ApiTags('bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard) // Protege todas as rotas de booking
@Controller('v1/bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova reserva (Usuários e Admins)' })
  @ApiResponse({ status: 201, description: 'Reserva criada com sucesso.', type: Booking })
  @ApiResponse({ status: 400, description: 'Datas inválidas ou regras de negócio violadas.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Sala não encontrada.' })
  @ApiResponse({ status: 409, description: 'Conflito de horário.' })
  create(
    @Body() createBookingDto: CreateBookingDto,
    @Req() req: RequestWithUser,
  ) {
    return this.bookingsService.create(createBookingDto, req.user);
  }

  // [NOVO] Endpoint de Admin para ver todas as reservas
  @Get('/all')
  @Roles(Role.ADMIN) // Protegido - Apenas Admins
  @ApiOperation({ summary: 'Lista TODAS as reservas (Admin)' })
  @ApiResponse({ status: 200, description: 'Lista de todas as reservas.', type: [Booking] })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  findAllAdmin() {
    return this.bookingsService.findAllAdmin('ASC');
  }

  // [NOVO] Endpoint para ver a agenda de uma sala
  @Get('/availability/room/:roomId')
  @ApiOperation({ summary: 'Verifica a disponibilidade de uma sala específica' })
  @ApiResponse({ status: 200, description: 'Lista de reservas ocupadas para o período.', type: [Booking] })
  @ApiResponse({ status: 400, description: 'Query de data inválida.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Sala não encontrada.' })
  findAvailability(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Query() queryDto: QueryAvailabilityDto, // Valida startDate e endDate
  ) {
    return this.bookingsService.findAvailabilityForRoom(roomId, queryDto);
  }

  @Get('/my-bookings') // Rota alterada para ser mais específica
  @ApiOperation({ summary: 'Lista as minhas reservas (Usuários e Admins)' })
  @ApiResponse({ status: 200, description: 'Lista de reservas.', type: [Booking] })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  findMyBookings(@Req() req: RequestWithUser) {
    return this.bookingsService.findAllForUser(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Busca uma reserva específica pelo ID (Dono ou Admin)',
  })
  @ApiResponse({ status: 200, description: 'Reserva retornada.', type: Booking })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  @ApiResponse({ status: 404, description: 'Reserva não encontrada.' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    return this.bookingsService.findOne(id, req.user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancela uma reserva (Dono ou Admin)' })
  @ApiResponse({ status: 204, description: 'Reserva cancelada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Não é possível cancelar reserva passada.'})
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  @ApiResponse({ status: 404, description: 'Reserva não encontrada.' })
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    return this.bookingsService.cancel(id, req.user);
  }
}