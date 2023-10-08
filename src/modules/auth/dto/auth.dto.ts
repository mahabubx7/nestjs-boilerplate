import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class ResendEmailDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}

export class ResetPasswordDto {
  @IsNotEmpty()
  @MinLength(6)
  readonly password: string;
}
