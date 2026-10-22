import { Transform } from 'class-transformer';
import { IsBoolean, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  text!: string;
}

export class CommentVisibilityDto {
  @IsBoolean()
  hidden!: boolean;
}
