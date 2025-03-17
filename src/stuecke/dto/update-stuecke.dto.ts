import { PartialType } from '@nestjs/mapped-types';
import { CreateStueckeDto } from './create-stuecke.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStueckeDto extends PartialType(CreateStueckeDto) {
  @ApiProperty({ description: 'Name of the Stück', required: false })
  name?: string;

  @ApiProperty({ description: 'Genre of the Stück', required: false })
  genre?: string;

  @ApiProperty({ description: 'Year of the Stück', required: false })
  jahr?: number;

  @ApiProperty({ description: 'Difficulty of the Stück', required: false })
  schwierigkeit?: string;

  @ApiProperty({ description: 'Is the Stück digitized', required: false })
  isdigitalisiert?: boolean;

  @ApiProperty({
    description: 'IDs of the composers',
    required: false,
    type: [Number],
  })
  composerIds?: number[];

  @ApiProperty({
    description: 'IDs of the arrangers',
    required: false,
    type: [Number],
  })
  arrangerIds?: number[];
}
