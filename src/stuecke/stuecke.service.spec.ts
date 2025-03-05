import { Test, TestingModule } from '@nestjs/testing';
import { StueckeService } from './stuecke.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('StueckeService', () => {
  let service: StueckeService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StueckeService, PrismaService],
    }).compile();

    service = module.get<StueckeService>(StueckeService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new Stück', async () => {
    const createStueckeDto = { name: 'Test Stück', composerIds: [1], arrangerIds: [2] };
    const createdStuecke = {
        stid: 1,
        name: 'Test Stück',
        genre: undefined,
        jahr: undefined,
        schwierigkeit: undefined,
        isdigitalisiert: undefined,
        komponiert: [{ person: { pid: 1 } }],
        arrangiert: [{ person: { pid: 2 } }],
    };
    const formattedStuecke = {
        stid: 1,
        name: 'Test Stück',
        genre: undefined,
        jahr: undefined,
        schwierigkeit: undefined,
        isdigitalisiert: undefined,
        composer_ids: [1],
        arranger_ids: [2],
    };
    prisma.stuecke.create = jest.fn().mockResolvedValue(createdStuecke);
    const result = await service.create(createStueckeDto);
    expect(result).toEqual(formattedStuecke);
  });

  it('should return all Stücke', async () => {
    const stueckeArray = [{ stid: 1, name: 'Test Stück' }];
    prisma.stuecke.findMany = jest.fn().mockResolvedValue(stueckeArray);
    const result = await service.findAll();
    expect(result).toEqual(stueckeArray);
  });

  it('should return a Stück by ID', async () => {
    const stuecke = { stid: 1, name: 'Test Stück' };
    prisma.stuecke.findUnique = jest.fn().mockResolvedValue(stuecke);
    const result = await service.findOne(1);
    expect(result).toEqual(stuecke);
  });

  it('should throw NotFoundException if Stück not found', async () => {
    prisma.stuecke.findUnique = jest.fn().mockResolvedValue(null);
    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });

  it('should update a Stück by ID', async () => {
    const updateStueckeDto = { name: 'Updated Stück' };
    prisma.stuecke.update = jest.fn().mockResolvedValue(updateStueckeDto);
    const result = await service.update(1, updateStueckeDto);
    expect(result).toEqual(updateStueckeDto);
  });

  it('should delete a Stück by ID', async () => {
    prisma.stuecke.delete = jest.fn().mockResolvedValue({ stid: 1 });
    const result = await service.remove(1);
    expect(result).toEqual({ stid: 1 });
  });
});
