import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Doe', description: 'O nome do usuário' })
  name?: string;

  @ApiPropertyOptional({ example: 'john.doe@example.com', description: 'O e-mail do usuário' })
  email?: string;
}