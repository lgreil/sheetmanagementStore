import { Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';

@Controller('stuecke')
export class StueckeController {
    @Get()
    findAll(): string {
        return 'This action returns all stuecke';
    }

    @Get(':id')
    findOne(@Param('id') id: string): string {
        return `This action returns a certain stueck`;
    }

    @Post()
    create(): string {
        return 'This action adds a new stueck';
    }

    @Put(':id')
    update(@Param('id') id: string): string {
        return `This action updates a certain stueck`;
    }

    @Delete(':id')
    remove(@Param('id') id: string): string {
        return `This action removes a certain stueck`;
    }
}
