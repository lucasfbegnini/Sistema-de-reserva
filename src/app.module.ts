import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// Remova imports de AuthModule, UsersModule, TypeOrmModule locais que continham lógica de negócio

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Registrar os clientes (Proxies) para cada serviço
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('AUTH_HOST') || 'localhost', // Nome do serviço no Docker
            port: 3001,
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'NOTIFICATIONS_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('NOTIFICATIONS_HOST') || 'localhost', // Nome do serviço no Docker
            port: 3002,
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'USERS_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('USERS_HOST') || 'localhost',
            port: 3003,
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'ROOMS_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('ROOMS_HOST') || 'localhost', // Nome do serviço no Docker
            port: 3004,
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'RESOURCES_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('RESOURCES_HOST') || 'localhost', // Nome do serviço no Docker
            port: 3005,
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'BOOKINGS_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('BOOKINGS_HOST') || 'localhost', // Nome do serviço no Docker
            port: 3006,
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AppController], // Você pode criar controllers específicos no gateway (ex: UsersGatewayController)
  providers: [AppService],
})
export class AppModule {}