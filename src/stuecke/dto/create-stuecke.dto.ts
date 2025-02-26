import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsBoolean,
    IsInt,
    IsArray,
    ArrayNotEmpty,
    ArrayUnique,
    IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStueckeDto {
    @ApiProperty({ description: 'Name of the Stück' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'Genre of the Stück', required: false })
    @IsOptional()
    @IsString()
    genre?: string;

    @ApiProperty({ description: 'Year of the Stück', required: false })
    @IsOptional()
    @IsInt()
    jahr?: number;

    @ApiProperty({ description: 'Difficulty of the Stück', required: false })
    @IsOptional()
    @IsString()
    schwierigkeit?: string;

    @ApiProperty({ description: 'Is the Stück digitized', required: false })
    @IsOptional()
    @IsBoolean()
    isdigitalisiert?: boolean;

    @ApiProperty({ description: 'IDs of the composers', required: false, type: [Number] })
    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsInt({ each: true })
    composerIds?: number[];

    @ApiProperty({ description: 'Names of the composers', required: false, type: [String] })
    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsString({ each: true })
    composerNames?: string[];

    @ApiProperty({ description: 'IDs of the arrangers', required: false, type: [Number] })
    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsInt({ each: true })
    arrangerIds?: number[];

    @ApiProperty({ description: 'Names of the arrangers', required: false, type: [String] })
    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsString({ each: true })
    arrangerNames?: string[];
}
