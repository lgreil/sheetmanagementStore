import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsBoolean,
    IsInt,
    IsArray,
} from 'class-validator';

export class CreateStueckeDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    genre?: string;

    @IsOptional()
    @IsInt()
    jahr?: number;

    @IsOptional()
    @IsString()
    schwierigkeit?: string;

    @IsOptional()
    @IsBoolean()
    isdigitalisiert?: boolean;

    // Under the hood, you work with IDs; on output these will be converted to names.
    @IsOptional()
    @IsArray()
    composerIds?: number[];

    @IsOptional()
    @IsArray()
    arrangerIds?: number[];
}
