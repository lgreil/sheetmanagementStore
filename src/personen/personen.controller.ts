import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { PersonenService } from './personen.service';
import { CreatePersonenDto } from './dto/create-personen.dto';
import { UpdatePersonenDto } from './dto/update-personen.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('personen')
@Controller('personen')
export class PersonenController {
    constructor(private readonly personenService: PersonenService) {}

    @ApiOperation({ summary: 'Create a new person' })
    @ApiResponse({ status: 201, description: 'The person has been successfully created.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    @Post()
    async create(@Body() createPersonenDto: CreatePersonenDto) {
        return this.personenService.create(createPersonenDto);
    }

    @ApiOperation({ summary: 'Get all persons' })
    @ApiResponse({ status: 200, description: 'Return all persons.' })
    @Get()
    async findAll() {
        return this.personenService.findAll();
    }

    @ApiOperation({ summary: 'Get a person by ID' })
    @ApiResponse({ status: 200, description: 'Return the person.' })
    @ApiResponse({ status: 404, description: 'Person not found.' })
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.personenService.findOne(+id);
    }

    @ApiOperation({ summary: 'Update a person by ID' })
    @ApiResponse({ status: 200, description: 'The person has been successfully updated.' })
    @ApiResponse({ status: 404, description: 'Person not found.' })
    @Patch(':id')
    async update(@Param('id') id: string, @Body() updatePersonenDto: UpdatePersonenDto) {
        return this.personenService.update(+id, updatePersonenDto);
    }

    @ApiOperation({ summary: 'Delete a person by ID' })
    @ApiResponse({ status: 200, description: 'The person has been successfully deleted.' })
    @ApiResponse({ status: 404, description: 'Person not found.' })
    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.personenService.remove(+id);
    }
}
