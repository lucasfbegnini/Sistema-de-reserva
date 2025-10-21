import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'; // 1. Importe os validadores

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'O nome do usuário' })
  @IsString()
  @IsNotEmpty({ message: 'O nome não pode ser vazio.' })
  name: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'O e-mail único do usuário', format: 'email' })
  @IsEmail({}, { message: 'Por favor, forneça um email válido.' })
  @IsNotEmpty({ message: 'O email não pode ser vazio.' })
  email: string;

  @ApiProperty({ example: 'strongPassword123', description: 'A senha do usuário (mínimo 8 caracteres)', format: 'password' })
  @IsString()
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres.' })
  @IsNotEmpty({ message: 'A senha não pode ser vazia.' })
  password: string;
}