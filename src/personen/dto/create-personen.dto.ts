import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsArray,
    IsInt,
    ArrayUnique
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePersonenDto {
    @ApiProperty({ description: 'The name of the person' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'The first name of the person', required: false })
    @IsOptional()
    @IsString()
    vorname?: string; // Made optional to match the decorator

    @ApiProperty({ description: 'List of composer IDs associated with the person', required: false, type: [Number] })
    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsInt({ each: true }) // Ensures all values in the array are integers
    composerIds?: number[];

    @ApiProperty({ description: 'List of arranger IDs associated with the person', required: false, type: [Number] })
    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsInt({ each: true }) // Ensures all values in the array are integers
    arrangerIds?: number[];
}
