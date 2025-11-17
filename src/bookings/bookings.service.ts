// src/bookings/bookings.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { Repository, LessThan, MoreThan, Between } from 'typeorm';
import { CreateBookingDto } from './dto/create-booking.dto';
import { RoomsService } from '../rooms/rooms.service';
import { Role } from '../users/enums/role.enum';
import { User } from '../users/entities/user.entity';
import { RoomStatus } from 'src/rooms/entities/room.entity';
import { QueryAvailabilityDto } from './dto/query-availability.dto';
// REMOVIDO: import { EventEmitter2 } from '@nestjs/event-emitter';
// REMOVIDO: import { BOOKING_CREATED_EVENT, BOOKING_CANCELLED_EVENT } from '../notifications/notifications.service';

// --- Constantes de Regra de Negócio ---
const MIN_NOTICE_MINUTES = 15;
const MAX_BOOKING_DURATION_HOURS = 4;
// -------------------------------------

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    private roomsService: RoomsService,
    // REMOVIDO: private eventEmitter: EventEmitter2, 
  ) {}

  async create(createBookingDto: CreateBookingDto, user: { userId: number; email: string; role: Role }): Promise<Booking> {
    const { roomId, startTime, endTime } = createBookingDto;
    const { userId } = user;

    // ... (Validações de Regra de Negócio) ...
    if (endTime <= startTime) {
      throw new BadRequestException('A data de término deve ser posterior à data de início');
    }
    const minStartDate = new Date(Date.now() + MIN_NOTICE_MINUTES * 60000);
    if (startTime < minStartDate) {
      throw new BadRequestException(`A reserva deve ser feita com pelo menos ${MIN_NOTICE_MINUTES} minutos de antecedência.`);
    }
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    if (durationHours > MAX_BOOKING_DURATION_HOURS) {
      throw new BadRequestException(`A duração máxima da reserva é de ${MAX_BOOKING_DURATION_HOURS} horas.`);
    }
    // --- Fim das Validações de Regra de Negócio ---


    const room = await this.roomsService.findOne(roomId); 
    if (room.status !== RoomStatus.AVAILABLE) {
      throw new ConflictException(
        'A sala não está disponível para reserva (ex: em manutenção)',
      );
    }

    const conflict = await this.findConflict(roomId, startTime, endTime);
    if (conflict) {
      throw new ConflictException(
        'A sala já está reservada para este período de tempo.',
      );
    }

    const newBooking = this.bookingsRepository.create({
      room: room,
      user: { id: userId } as User,
      startTime,
      endTime,
      status: BookingStatus.CONFIRMED,
      createdById: userId, // AUDITORIA: Quem criou
      updatedById: userId, // AUDITORIA: Quem atualizou pela última vez
    });

    const savedBooking = await this.bookingsRepository.save(newBooking);

    return savedBooking;
  }

  // Busca todas as reservas do usuário logado
  async findAllForUser(userId: number): Promise<Booking[]> {
    return this.bookingsRepository.find({
      where: {
        user: { id: userId },
        status: BookingStatus.CONFIRMED,
      },
      order: {
        startTime: 'ASC',
      },
    });
  }

  // [NOVO] Busca todas as reservas (para Admins)
  async findAllAdmin(order: 'ASC' | 'DESC' = 'ASC'): Promise<Booking[]> {
    return this.bookingsRepository.find({
      where: {
        status: BookingStatus.CONFIRMED,
      },
      order: {
        startTime: order,
      },
    });
  }

  // [NOVO] Busca agenda de uma sala específica
  async findAvailabilityForRoom(
    roomId: number,
    queryDto: QueryAvailabilityDto,
  ): Promise<Booking[]> {
    const { startDate, endDate } = queryDto;

    // Garante que a sala existe (ou lança 404)
    await this.roomsService.findOne(roomId);
    
    // Validação simples de datas
    if (endDate <= startDate) {
      throw new BadRequestException('A data de término deve ser posterior à data de início');
    }

    return this.bookingsRepository.find({
      where: {
        room: { id: roomId },
        status: BookingStatus.CONFIRMED,
        startTime: Between(startDate, endDate),
      },
      order: {
        startTime: 'ASC',
      },
    });
  }

  // Busca uma reserva específica, verificando a permissão
  async findOne(id: number, user: any): Promise<Booking> {
    const booking = await this.bookingsRepository.findOneBy({ id });
    if (!booking) {
      throw new NotFoundException(`Reserva com ID ${id} não encontrada.`);
    }

    if (user.role !== Role.ADMIN && booking.user.id !== user.userId) {
      throw new ForbiddenException(
        'Você não tem permissão para ver esta reserva.',
      );
    }

    return booking;
  }

  // Cancela (soft delete) uma reserva
  async cancel(id: number, user: { userId: number; email: string; role: Role }): Promise<void> {
    const { userId } = user;
    const booking = await this.findOne(id, user);

    if (new Date() > new Date(booking.startTime)) {
      throw new BadRequestException(
        'Não é possível cancelar uma reserva que já ocorreu.',
      );
    }

    booking.status = BookingStatus.CANCELLED;
    booking.updatedById = userId; // AUDITORIA: Quem cancelou
    await this.bookingsRepository.save(booking);
  }

  /**
   * Lógica principal de conflito.
   */
  private async findConflict(roomId: number, startTime: Date, endTime: Date) {
    return this.bookingsRepository.findOne({
      where: {
        room: { id: roomId },
        status: BookingStatus.CONFIRMED,
        startTime: LessThan(endTime),
        endTime: MoreThan(startTime),
      },
    });
  }
}