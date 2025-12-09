import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './users/entities/user.entity'; // Certifique-se que a entidade foi movida para este pacote
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST, // Lerá 'postgres' do docker-compose
      port: 5432,
      username: process.env.POSTGRES_USER || 'admin', // Padronize com o docker-compose
      password: process.env.POSTGRES_PASSWORD || 'admin',
      database: process.env.DB_NAME, // Lerá 'users_db' do docker-compose
      autoLoadEntities: true,
      synchronize: true, // Use false em produção
    }),
    UsersModule,
  ],
})
export class AppModule {}