import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'; // Adicione validadores

export class LoginAuthDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail({}, { message: 'Por favor, forneça um email válido.' }) // Validador
  @IsNotEmpty({ message: 'O email não pode ser vazio.' }) // Validador
  email: string; // <-- Definição da propriedade

  @ApiProperty({ example: 'strongPassword123' })
  @IsString() // Validador
  @IsNotEmpty({ message: 'A senha não pode ser vazia.' }) // Validador
  password: string; // <-- Definição da propriedade
}