import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [], // Adicionaremos os controllers depois
  providers: [], // Adicionaremos os services depois
})
export class UsersModule {}
