import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePersonenDto } from './dto/create-personen.dto';
import { UpdatePersonenDto } from './dto/update-personen.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('personen')
@Injectable()
export class PersonenService {
  constructor(private prisma: PrismaService) {}

  async findOrCreatePerson(name: string, vorname: string): Promise<number> {
    const existingPerson = await this.prisma.person.findUnique({
      where: {
        name_vorname_unique: {
          name,
          vorname,
        },
      },
    });
    if (existingPerson) {
      return existingPerson.pid;
    }
    const newPerson = await this.prisma.person.create({
      data: {
        name,
        vorname,
      },
    });
    return newPerson.pid;
  }

  @ApiOperation({ summary: 'Create a new person' })
  @ApiResponse({
    status: 201,
    description: 'The person has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(createPersonenDto: CreatePersonenDto) {
    return this.prisma.person.create({
      data: createPersonenDto,
    });
  }

  @ApiOperation({ summary: 'Get all persons' })
  @ApiResponse({ status: 200, description: 'Return all persons.' })
  findAll() {
    return this.prisma.person.findMany();
  }

  @ApiOperation({ summary: 'Get a person by ID' })
  @ApiResponse({ status: 200, description: 'Return the person.' })
  @ApiResponse({ status: 404, description: 'Person not found.' })
  async findOne(id: number) {
    const person = await this.prisma.person.findUnique({ where: { pid: id } });
    if (!person) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }
    return person;
  }

  @ApiOperation({ summary: 'Update a person by ID' })
  @ApiResponse({
    status: 200,
    description: 'The person has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Person not found.' })
  update(pid: number, updatePersonenDto: UpdatePersonenDto) {
    return this.prisma.person.update({
      where: { pid },
      data: updatePersonenDto,
    });
  }

  @ApiOperation({ summary: 'Delete a person by ID' })
  @ApiResponse({
    status: 200,
    description: 'The person has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Person not found.' })
  remove(pid: number) {
    return this.prisma.person.delete({
      where: { pid },
    });
  }
}
