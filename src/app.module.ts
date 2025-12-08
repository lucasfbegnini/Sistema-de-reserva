import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// Remova imports de AuthModule, UsersModule, TypeOrmModule locais que continham lógica de negócio
import { UsersModule } from './users/users.module';
import { BookingsModule } from './bookings/bookings.module';
import { AuthModule } from './auth/auth.module';
import { RoomsModule } from './rooms/rooms.module';
import { ResourcesModule } from './resources/resources.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    RoomsModule,
    ResourcesModule,
    BookingsModule,
    // Registrar os clientes (Proxies) para cada serviço
    
  ],
  controllers: [AppController], // Você pode criar controllers específicos no gateway (ex: UsersGatewayController)
  providers: [AppService],
})
export class AppModule {}