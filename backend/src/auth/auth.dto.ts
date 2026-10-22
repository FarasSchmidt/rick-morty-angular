import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength, ValidateIf, Matches } from 'class-validator';

export class LoginDto {
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password!: string;
}

export class RegisterDto extends LoginDto {
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;
}

export class UpdateProfileDto {
  @ValidateIf((_input, value) => value !== undefined)
  @IsString()
  @MaxLength(180000)
  @Matches(/^(?:|data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2})$/)
  profilePhoto?: string;

  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @ValidateIf((input: UpdateProfileDto) => input.newPassword !== undefined || input.currentPassword !== undefined)
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  currentPassword?: string;

  @ValidateIf((input: UpdateProfileDto) => input.newPassword !== undefined || input.currentPassword !== undefined)
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  newPassword?: string;
}
