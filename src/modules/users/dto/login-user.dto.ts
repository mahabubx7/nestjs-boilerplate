import { IsEmail, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    type: String,
    example: 'mahabub@mail.com',
    description: "User's Email-address",
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    type: String,
    example: '12345678',
    description: "User's password",
  })
  @IsNotEmpty()
  @Min(6)
  password: string;
}
