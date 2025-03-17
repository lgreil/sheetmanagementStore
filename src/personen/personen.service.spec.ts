import { Test, TestingModule } from '@nestjs/testing';
import { PersonenService } from './personen.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { create } from 'domain';


describe('PersonenService', () => {
  let service: PersonenService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PersonenService, PrismaService],
    }).compile();

    service = module.get<PersonenService>(PersonenService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new person', async () => {
    const createPersonenDto = { name: 'Doe', vorname: 'John' };
    prisma.person.create = jest.fn().mockResolvedValue(createPersonenDto);
    const result = await service.create(createPersonenDto);
    expect(result).toEqual(createPersonenDto);
  });

  it('should return all persons', async () => {
    const personsArray = [{ pid: 1, name: 'Doe', vorname: 'John' }];
    prisma.person.findMany = jest.fn().mockResolvedValue(personsArray);
    const result = await service.findAll();
    expect(result).toEqual(personsArray);
  });

  it('should return a person by ID', async () => {
    const person = { pid: 1, name: 'Doe', vorname: 'John' };
    prisma.person.findUnique = jest.fn().mockResolvedValue(person);
    const result = await service.findOne(1);
    expect(result).toEqual(person);
  });

  it('should throw NotFoundException if person not found', async () => {
    prisma.person.findUnique = jest.fn().mockResolvedValue(null);
    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });

  it('should update a person by ID', async () => {
    const updatePersonenDto = { name: 'Doe', vorname: 'Jane' };
    prisma.person.update = jest.fn().mockResolvedValue(updatePersonenDto);
    const result = await service.update(1, updatePersonenDto);
    expect(result).toEqual(updatePersonenDto);
  });

  it('should delete a person by ID', async () => {
    prisma.person.delete = jest.fn().mockResolvedValue({ pid: 1 });
    const result = await service.remove(1);
    expect(result).toEqual({ pid: 1 });
  });

  it('should create a new person if not found in db already', async () => {
    const createPersonenDto = { name: 'Doe', vorname: 'John' };
    prisma.person.create = jest.fn().mockResolvedValue(createPersonenDto);
    const result = await service.findOrCreatePerson(createPersonenDto.name, createPersonenDto.vorname);
    expect(result).toEqual(createPersonenDto);
  });

  it('should find a person if already in db', async () => {
    const person = { name: 'Doe', vorname: 'John' };
    prisma.person.create = jest.fn().mockResolvedValue(person);
    const result = await service.findOrCreatePerson(person.name, person.vorname);
    expect(result).toEqual(1);
  });
