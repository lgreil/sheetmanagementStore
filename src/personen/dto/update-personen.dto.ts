import { PartialType } from '@nestjs/mapped-types';
import { CreatePersonenDto } from './create-personen.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePersonenDto extends PartialType(CreatePersonenDto) {
    @ApiProperty({ description: 'Names of the composed pieces associated with this person', required: false, type: [String] })
    composerNames?: string[];

    @ApiProperty({ description: 'Names of the arranged pieces associated with this person', required: false, type: [String] })
    arrangerNames?: string[];
}
