import { PartialType } from '@nestjs/mapped-types';
import { CreatePersonenDto } from './create-personen.dto';

export class UpdatePersonenDto extends PartialType(CreatePersonenDto) { }
