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
import { Repository, LessThan, MoreThan, Between } from 'typeorm'; // Importar Between
import { CreateBookingDto } from './dto/create-booking.dto';
import { RoomsService } from '../rooms/rooms.service';
import { Role } from '../users/enums/role.enum';
import { User } from '../users/entities/user.entity';
import { RoomStatus } from 'src/rooms/entities/room.entity';
import { QueryAvailabilityDto } from './dto/query-availability.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  BOOKING_CREATED_EVENT,
  BOOKING_CANCELLED_EVENT,
} from '../notifications/notifications.service';

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
    private eventEmitter: EventEmitter2, 
  ) {}

  async create(createBookingDto: CreateBookingDto, user: any): Promise<Booking> {
    const { roomId, startTime, endTime } = createBookingDto;

    // --- Início das Validações de Regra de Negócio ---

    // 1. Validar se a data de término é posterior à de início
    if (endTime <= startTime) {
      throw new BadRequestException(
        'A data de término deve ser posterior à data de início',
      );
    }

    // 2. Validar se a reserva não está sendo feita no passado
    const minStartDate = new Date(Date.now() + MIN_NOTICE_MINUTES * 60000); // 15 minutos a partir de agora
    if (startTime < minStartDate) {
      throw new BadRequestException(
        `A reserva deve ser feita com pelo menos ${MIN_NOTICE_MINUTES} minutos de antecedência.`,
      );
    }

    // 3. Validar a duração máxima da reserva
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    if (durationHours > MAX_BOOKING_DURATION_HOURS) {
      throw new BadRequestException(
        `A duração máxima da reserva é de ${MAX_BOOKING_DURATION_HOURS} horas.`,
      );
    }
    
    // --- Fim das Validações de Regra de Negócio ---


    // 4. Validar se a sala existe e está disponível
    const room = await this.roomsService.findOne(roomId); 
    if (room.status !== RoomStatus.AVAILABLE) {
      throw new ConflictException(
        'A sala não está disponível para reserva (ex: em manutenção)',
      );
    }

    // 5. Verificar conflitos de horário
    const conflict = await this.findConflict(roomId, startTime, endTime);
    if (conflict) {
      throw new ConflictException(
        'A sala já está reservada para este período de tempo.',
      );
    }

    // 6. Criar e salvar a reserva
    const newBooking = this.bookingsRepository.create({
      room: room,
      user: { id: user.userId } as User, // Associa ao usuário autenticado
      startTime,
      endTime,
      status: BookingStatus.CONFIRMED,
    });

    const savedBooking = await this.bookingsRepository.save(newBooking);

    this.eventEmitter.emit(BOOKING_CREATED_EVENT, savedBooking);

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
      // Pode ser útil adicionar paginação aqui no futuro
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
        // Encontra reservas que comecem ou terminem dentro do período de consulta
        startTime: Between(startDate, endDate),
        // Ou endTime: Between(startDate, endDate),
        // A lógica de conflito (startTime < endDate && endTime > startDate) também funciona bem aqui
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

    // Admin pode ver tudo, usuário comum só pode ver suas próprias reservas
    if (user.role !== Role.ADMIN && booking.user.id !== user.userId) {
      throw new ForbiddenException(
        'Você não tem permissão para ver esta reserva.',
      );
    }

    return booking;
  }

  // Cancela (soft delete) uma reserva
  async cancel(id: number, user: any): Promise<void> {
    const booking = await this.findOne(id, user); // findOne já faz a checagem de permissão

    // Não permitir cancelamento de reserva que já passou
    if (new Date() > new Date(booking.startTime)) {
      throw new BadRequestException(
        'Não é possível cancelar uma reserva que já ocorreu.',
      );
    }

    booking.status = BookingStatus.CANCELLED;
    await this.bookingsRepository.save(booking);

    this.eventEmitter.emit(BOOKING_CANCELLED_EVENT, booking);
  }

  /**
   * Lógica principal de conflito.
   * (NovaStartTime < ReservaEndTime) E (NovaEndTime > ReservaStartTime)
   */
  private async findConflict(roomId: number, startTime: Date, endTime: Date) {
    return this.bookingsRepository.findOne({
      where: {
        room: { id: roomId },
        status: BookingStatus.CONFIRMED, // Só checa contra reservas confirmadas
        startTime: LessThan(endTime), // startTime < newEndTime
        endTime: MoreThan(startTime), // endTime > newStartTime
      },
    });
  }
}