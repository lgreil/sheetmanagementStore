import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { CreateStueckeDto } from './dto/create-stuecke.dto';
import StueckeService from './stuecke.service';
import { UpdateStueckeDto } from './dto/update-stuecke.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConvertIdNameInterceptor } from 'src/interceptors/convert-id-name.interceptor';
import { ConvertNameIdInterceptor } from 'src/interceptors/convert-name-id.interceptor';

@ApiTags('stuecke')
@Controller('stuecke')
export class StueckeController {
  constructor(private readonly stueckeService: StueckeService) {}

  @ApiOperation({ summary: 'Create a new Stück' })
  @ApiResponse({
    status: 201,
    description: 'The Stück has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @Post()
  async create(@Body() createStueckeDto: CreateStueckeDto) {
    return this.stueckeService.create(createStueckeDto);
  }

  @ApiOperation({ summary: 'Get all Stücke' })
  @ApiResponse({ status: 200, description: 'Return all Stücke.' })
  @UseInterceptors(ConvertIdNameInterceptor)
  @Get()
  async findAll() {
    return this.stueckeService.findAll();
  }

  @ApiOperation({ summary: 'Get a Stück by ID' })
  @ApiResponse({ status: 200, description: 'Return the Stück.' })
  @ApiResponse({ status: 404, description: 'Stück not found.' })
  @Get(':id')
  @UseInterceptors(ConvertIdNameInterceptor)
  async findOne(@Param('id') id: string) {
    return this.stueckeService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a Stück by ID' })
  @ApiResponse({
    status: 200,
    description: 'The Stück has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Stück not found.' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateStueckeDto: UpdateStueckeDto,
  ) {
    return this.stueckeService.update(+id, updateStueckeDto);
  }

  @ApiOperation({ summary: 'Delete a Stück by ID' })
  @ApiResponse({
    status: 200,
    description: 'The Stück has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Stück not found.' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.stueckeService.remove(+id);
  }
}
