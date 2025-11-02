import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Importar ConfigModule e ConfigService

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({ // Mudar para registerAsync
      imports: [ConfigModule], // Importar ConfigModule aqui também
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Buscar o segredo do .env
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService], // Injetar ConfigService
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService]
})
export class AuthModule {}