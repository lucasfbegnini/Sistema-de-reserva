import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  Inject, 
  UseGuards, 
  ParseIntPipe, 
  Req 
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

// DTOs locais (para validação HTTP)
import { CreateBookingDto } from './dto/create-booking.dto';

// Segurança
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/enums/role.enum'; // Ajuste o caminho conforme sua estrutura
import { Booking } from './entities/booking.entity'; // Apenas para o Swagger (classe limpa)

@ApiTags('bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/bookings')
export class BookingsController {
  constructor(
    @Inject('BOOKINGS_SERVICE') private readonly client: ClientProxy
  ) {}

  @Post()
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Cria uma nova reserva' })
  @ApiResponse({ status: 201, description: 'Reserva criada.', type: Booking })
  create(@Body() createBookingDto: CreateBookingDto, @Req() req: any) {
    return this.client.send({ cmd: 'create_booking' }, { 
      dto: createBookingDto, 
      user: { 
        userId: req.user.userId, 
        email: req.user.email, 
        role: req.user.role 
      }
    });
  }

  @Get('my-bookings')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Lista as reservas do usuário logado' })
  findAllForUser(@Req() req: any) {
    return this.client.send({ cmd: 'find_user_bookings' }, req.user.userId);
  }

  @Get('admin/all')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Lista todas as reservas (Admin)' })
  findAllAdmin() {
    return this.client.send({ cmd: 'find_all_bookings_admin' }, {});
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Busca detalhes de uma reserva por id, (Admin)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.client.send({ cmd: 'find_one_booking' }, { id });
  }

  @Delete(':id') // Ou @Patch(':id/cancel') dependendo da sua preferência
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Cancela uma reserva' })
  cancel(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.client.send({ cmd: 'cancel_booking' }, { 
      id, 
      user: { 
        userId: req.user.userId
      }
    });
  }
}