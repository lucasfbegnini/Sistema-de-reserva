import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Between, Not } from 'typeorm';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { Booking, BookingStatus } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { QueryAvailabilityDto } from './dto/query-availability.dto';

// Se você tiver o enum compartilhado ou copiado:
// import { Role } from './enums/role.enum'; 
// Caso contrário, usamos string ou 'ADMIN' | 'USER' hardcoded por enquanto.

const MIN_NOTICE_MINUTES = 15;
const MAX_BOOKING_DURATION_HOURS = 4;

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    @Inject('ROOMS_SERVICE') private roomsClient: ClientProxy, // Cliente para Salas
    @Inject('NOTIFICATIONS_SERVICE') private notificationsClient: ClientProxy, // Cliente para Notificações
  ) {}

  async create(createBookingDto: CreateBookingDto, user: { userId: number; email: string; role: string }) {
    const { roomId, startTime, endTime } = createBookingDto;
    const start = new Date(startTime);
    const end = new Date(endTime);

    // --- 1. Validações de Regra de Negócio (Datas) ---
    if (end <= start) {
      throw new RpcException(new BadRequestException('A data de término deve ser posterior à data de início'));
    }

    const minStartDate = new Date(Date.now() + MIN_NOTICE_MINUTES * 60000);
    if (start < minStartDate) {
      throw new RpcException(new BadRequestException(`A reserva deve ser feita com pelo menos ${MIN_NOTICE_MINUTES} minutos de antecedência.`));
    }

    const durationMs = end.getTime() - start.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    if (durationHours > MAX_BOOKING_DURATION_HOURS) {
      throw new RpcException(new BadRequestException(`A duração máxima da reserva é de ${MAX_BOOKING_DURATION_HOURS} horas.`));
    }

    // --- 2. Validação Remota: Sala Existe e está Disponível? ---
    let room;
    try {
      // Chama o microserviço de salas
      room = await lastValueFrom(this.roomsClient.send({ cmd: 'find_one_room' }, roomId));
    } catch (e) {
      throw new RpcException(new NotFoundException(`Sala ${roomId} não encontrada ou serviço indisponível.`));
    }

    if (!room) {
      throw new RpcException(new NotFoundException(`Sala ${roomId} não encontrada.`));
    }

    // Verifica status da sala (Assumindo que o objeto room retornado tem o campo status)
    if (room.status !== 'AVAILABLE') { 
      throw new RpcException(new ConflictException('A sala não está disponível para reserva (ex: em manutenção)'));
    }

    // --- 3. Validação Local: Conflito de Horário? ---
    const conflict = await this.findConflict(roomId, start, end);
    if (conflict) {
      throw new RpcException(new ConflictException('A sala já está reservada para este período de tempo.'));
    }

    // --- 4. Salvar Reserva ---
    const newBooking = this.bookingsRepository.create({
      roomId: roomId,         // Apenas ID
      userId: user.userId,    // Apenas ID
      startTime: start,
      endTime: end,
      status: BookingStatus.CONFIRMED,
      // createdById e updatedById podem ser adicionados se sua entidade tiver
    });

    const savedBooking = await this.bookingsRepository.save(newBooking);

    // --- 5. Notificação (Evento) ---
    const eventPayload = {
      id: savedBooking.id,
      startTime: savedBooking.startTime.toISOString(),
      endTime: savedBooking.endTime.toISOString(),
      user: { id: user.userId, email: user.email },
      room: { name: room.name }, // Usamos o nome que veio do serviço de salas
    };

    this.notificationsClient.emit('booking_created', eventPayload);
    this.logger.log(`Reserva ${savedBooking.id} criada para user ${user.userId}`);

    return savedBooking;
  }

  async findAllForUser(userId: number) {
    return this.bookingsRepository.find({
      where: {
        userId: userId, // Busca direta pelo ID
        status: BookingStatus.CONFIRMED,
      },
      order: { startTime: 'ASC' },
    });
  }

  async findAllAdmin() {
    return this.bookingsRepository.find({
      where: { status: BookingStatus.CONFIRMED },
      order: { startTime: 'ASC' },
    });
  }

  async findAvailabilityForRoom(roomId: number, queryDto: QueryAvailabilityDto) {
    const { startDate, endDate } = queryDto;

    // Opcional: Verificar se sala existe remotamente antes de buscar
    // Mas buscar vazio no banco local também funciona e é mais rápido se a sala não tiver reservas.
    // Vamos manter a consistência e checar se a sala existe.
    try {
       const room = await lastValueFrom(this.roomsClient.send({ cmd: 'find_room_id' }, roomId));
       if (!room) throw new Error();
    } catch {
       throw new RpcException(new NotFoundException('Sala não encontrada.'));
    }

    return this.bookingsRepository.find({
      where: {
        roomId: roomId,
        status: BookingStatus.CONFIRMED,
        startTime: Between(new Date(startDate), new Date(endDate)),
      },
      order: { startTime: 'ASC' },
    });
  }

  async findOne(id: number, user: { userId: number; role: string }) {
    const booking = await this.bookingsRepository.findOneBy({ id });
    if (!booking) {
      throw new RpcException(new NotFoundException(`Reserva com ID ${id} não encontrada.`));
    }

    // Validação de Permissão
    if (user.role !== 'ADMIN' && booking.userId !== user.userId) {
      throw new RpcException(new ForbiddenException('Você não tem permissão para ver esta reserva.'));
    }

    return booking;
  }

  async cancel(id: number, user: { userId: number; email: string; role: string }) {
    const booking = await this.findOne(id, user); // Já valida existência e permissão

    if (new Date() > new Date(booking.startTime)) {
      throw new RpcException(new BadRequestException('Não é possível cancelar uma reserva que já ocorreu.'));
    }

    booking.status = BookingStatus.CANCELLED;
    booking.updatedById = user.userId;
    await this.bookingsRepository.save(booking);

    // Preciso buscar o nome da sala remotamente para o e-mail
    let roomName = 'Sala';
    try {
      const room = await lastValueFrom(this.roomsClient.send({ cmd: 'find_one_room' }, booking.roomId));
      if (room) roomName = room.name;
    } catch (e) {
      this.logger.warn(`Não foi possível buscar nome da sala para notificação de cancelamento: ${e.message}`);
    }

    const eventPayload = {
      id: booking.id,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      user: { id: user.userId, email: user.email },
      room: { name: roomName },
    };

    this.notificationsClient.emit('booking_cancelled', eventPayload);

    return { 
      success: true, 
      message: `Reserva ${booking.id} cancelada com sucesso.`, 
      booking: booking 
    };
  }

  private async findConflict(roomId: number, start: Date, end: Date) {
    return this.bookingsRepository.findOne({
      where: {
        roomId: roomId,
        status: BookingStatus.CONFIRMED,
        startTime: LessThan(end),
        endTime: MoreThan(start),
      },
    });
  }
}