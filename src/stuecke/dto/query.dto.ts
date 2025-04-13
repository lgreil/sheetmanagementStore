import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from "class-validator";

export class PaginationDto {
  @IsNumber()
  @IsPositive()
  @IsOptional()
  skip: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  limit: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  page: number;
}
export class SortParamsDto {
  sortBy?: "name" | "genre" | "jahr" | "schwierigkeit";
  sortOrder?: "asc" | "desc";
}

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
