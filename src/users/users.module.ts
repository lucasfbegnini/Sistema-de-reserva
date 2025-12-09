import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
      ClientsModule.register([
        {
          name: 'USERS_SERVICE',
          transport: Transport.TCP,
          options: {
            host: process.env.USERS_HOST || 'users-service',
            port: 3003,
          },
        },
      ]),
    ],
  controllers: [UsersController],
  providers: [],
  exports: [ClientsModule],
})
export class UsersModule {}