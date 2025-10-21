import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Doe', description: 'O nome do usuário' })
  name?: string;

  @ApiPropertyOptional({ example: 'john.doe@example.com', description: 'O novo e-mail do usuário (deve ser único)', format: 'email' })
  email?: string;
}