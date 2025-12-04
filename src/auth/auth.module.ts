import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy'; // Adicionei a Local aqui
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // Cliente TCP para falar com o Auth Service (Porta 3001)
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.AUTH_HOST || 'auth-service',
          port: 3001,
        },
      },
    ]),
    PassportModule,
    // Mantemos JwtModule para o JwtStrategy ler a Secret, mas não para assinar (quem assina é o microserviço)
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, LocalStrategy], // Sem AuthService!
  exports: [ClientsModule], 
})
export class AuthModule {}