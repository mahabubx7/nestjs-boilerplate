import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Roles } from 'src/modules/roles/role.entity';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  roles?: Roles[];
}
