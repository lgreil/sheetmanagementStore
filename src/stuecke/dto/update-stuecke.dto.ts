import { PartialType } from '@nestjs/mapped-types';
import { CreateStueckeDto } from './create-stuecke.dto';

export class UpdateStueckeDto extends PartialType(CreateStueckeDto) { }
