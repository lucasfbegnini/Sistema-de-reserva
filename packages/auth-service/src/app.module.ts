import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
//coment
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST, // Lerá 'postgres' do docker-compose
      port: 5432,
      username: process.env.POSTGRES_USER || 'admin', // Padronize com o docker-compose
      password: process.env.POSTGRES_PASSWORD || 'admin',
      database: process.env.POSTGRES_DB,

      schema: process.env.AUTSCHEMA,

      autoLoadEntities: true,
      synchronize: true, // Use false em produção

      extra:{
        options: `-c search_path=${process.env.AUTSCHEMA},public`
      }

      //migrationsRun: true,
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}