import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import StueckeService from './stuecke/stuecke.service';
import { CreateStueckeDto } from './stuecke/dto/create-stuecke.dto';
import { UpdateStueckeDto } from './stuecke/dto/update-stuecke.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('stuecke')
@Controller('stuecke')
export class AppController {
  constructor(private readonly stueckeService: StueckeService) {}

  @Post()
  create(@Body() createStueckeDto: CreateStueckeDto) {
    return this.stueckeService.create(createStueckeDto);
  }

  @Get()
  findAll() {
    return this.stueckeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stueckeService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStueckeDto: UpdateStueckeDto,
  ) {
    return this.stueckeService.update(id, updateStueckeDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.stueckeService.remove(id);
  }
}
