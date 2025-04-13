import { IsBoolean, IsOptional, IsString } from "class-validator";

export class FilterParamsDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  genre?: string;

  @IsBoolean()
  @IsOptional()
  isdigitalisiert?: boolean;

  @IsString()
  @IsOptional()
  composerName?: string;

  @IsString()
  @IsOptional()
  arrangerName?: string;
}
