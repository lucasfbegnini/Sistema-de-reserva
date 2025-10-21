import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { AuthModule } from './auth/auth.module'; 
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RoomsModule } from './rooms/rooms.module';
import { ResourcesModule } from './resources/resources.module';
import { Room } from './rooms/entities/room.entity'; 
import { Resource } from './resources/entities/resource.entity'; 

@Module({
  imports: [
    HealthModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [User, Room, Resource],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    RoomsModule,
    ResourcesModule, 
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { 
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}