import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { PersonenService } from './personen.service';
import { CreatePersonenDto } from './dto/create-personen.dto';
import { UpdatePersonenDto } from './dto/update-personen.dto';

@Controller('personen')
export class PersonenController {
    constructor(private readonly personenService: PersonenService) {}

    @Post()
    async create(@Body() createPersonenDto: CreatePersonenDto) {
        return this.personenService.create(createPersonenDto);
    }

    @Get()
    async findAll() {
        return this.personenService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.personenService.findOne(+id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updatePersonenDto: UpdatePersonenDto) {
        return this.personenService.update(+id, updatePersonenDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.personenService.remove(+id);
    }
}
