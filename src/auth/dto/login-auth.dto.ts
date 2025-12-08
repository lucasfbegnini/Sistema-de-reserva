import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'; // Adicione validadores

export class LoginAuthDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'Endereço de e-mail único do usuário', format: 'email' })
  @IsEmail({}, { message: 'Por favor, forneça um email válido.' }) // Validador
  @IsNotEmpty({ message: 'O email não pode ser vazio.' }) // Validador
  email: string; // <-- Definição da propriedade

  @ApiProperty({ example: 'strongPassword123', description: 'Senha do usuário (mínimo 8 caracteres)', format: 'password' })
  @IsString() // Validador
  @IsNotEmpty({ message: 'A senha não pode ser vazia.' }) // Validador
  password: string; // <-- Definição da propriedade
}