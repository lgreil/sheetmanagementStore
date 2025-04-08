import { Injectable, NotFoundException } from '@nestjs/common';
import { PersonenRepository } from '../repositories/personen.repository';
import { Person } from '@prisma/client';
import { CreatePersonenDto } from './dto/create-personen.dto';
import { UpdatePersonenDto } from './dto/update-personen.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('personen')
@Injectable()
export class PersonenService {
  constructor(private readonly personenRepository: PersonenRepository) {}

  async findAll(): Promise<Person[]> {
    return this.personenRepository.findAll();
  }

  async findOne(id: number): Promise<Person> {
    const person = await this.personenRepository.findById(id);
    if (!person) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }
    return person;
  }

  async findOrCreatePerson(fullName: string, role: 'composer' | 'arranger'): Promise<number> {
    const [vorname, ...rest] = fullName.trim().split(' ');
    const name = rest.join(' ') || vorname;

    const person = await this.personenRepository.findOrCreate({
      name,
      vorname
    });

    return person.pid;
  }

  @ApiOperation({ summary: 'Create a new person' })
  @ApiResponse({
    status: 201,
    description: 'The person has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(createPersonenDto: CreatePersonenDto) {
    return this.personenRepository.create(createPersonenDto);
  }

  @ApiOperation({ summary: 'Update a person by ID' })
  @ApiResponse({
    status: 200,
    description: 'The person has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Person not found.' })
  update(pid: number, updatePersonenDto: UpdatePersonenDto) {
    return this.personenRepository.update(pid, updatePersonenDto);
  }

  @ApiOperation({ summary: 'Delete a person by ID' })
  @ApiResponse({
    status: 200,
    description: 'The person has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Person not found.' })
  remove(pid: number) {
    return this.personenRepository.delete(pid);
  }
}
