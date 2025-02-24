import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsArray,
} from 'class-validator';

export class CreatePersonenDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    vorname: string;
    
    // Under the hood, you work with IDs; on output these will be converted to names.
    @IsOptional()
    @IsArray()
    composerIds?: number[];

    @IsOptional()
    @IsArray()
    arrangerIds?: number[];
}
