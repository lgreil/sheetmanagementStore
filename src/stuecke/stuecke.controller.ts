import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { CreateStueckeDto } from './dto/create-stuecke.dto';
import { StueckeService } from './stuecke.service';
import { UpdateStueckeDto } from './dto/update-stuecke.dto';

@Controller('stuecke')
export class StueckeController {
    constructor(private readonly stueckeService: StueckeService) {}

    @Post()
    async create(@Body() createStueckeDto: CreateStueckeDto) {
        return this.stueckeService.create(createStueckeDto);
    }

    @Get()
    async findAll() {
        return this.stueckeService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.stueckeService.findOne(+id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateStueckeDto: UpdateStueckeDto) {
        return this.stueckeService.update(+id, updateStueckeDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.stueckeService.remove(+id);
    }
}
