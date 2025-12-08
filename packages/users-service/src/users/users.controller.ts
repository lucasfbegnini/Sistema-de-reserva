import { Controller} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller()
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @MessagePattern({ cmd: 'create_user' })
  create(@Payload() data: { dto: CreateUserDto; adminId: number }) { return this.service.create(data.dto, data.adminId); }

  @MessagePattern({ cmd: 'find_all_users' })
  findAll(@Payload() _payload: any) { return this.service.findAll(); }

  @MessagePattern({ cmd: 'find_one_user' })
  findOne(@Payload() id: number) { return this.service.findOne(id); }

  @MessagePattern({ cmd: 'update_user' })
  update(@Payload() data: { id: number; dto: UpdateUserDto; adminId: number }) { return this.service.update(data.id, data.dto, data.adminId); }

  @MessagePattern({ cmd: 'remove_user' })
  remove(@Payload() data: { id: number; adminId: number }) { return this.service.remove(data.id, data.adminId); }

  // CRÍTICO: Usado pelo Auth Service
  @MessagePattern({ cmd: 'find_user_by_email' })
  findByEmail(@Payload() email: string) { return this.service.findByEmail(email); }
}