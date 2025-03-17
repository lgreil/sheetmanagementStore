import { Test, TestingModule } from '@nestjs/testing';
import StueckeService from './stuecke.service';
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

    const createStueckeDto = {
      name: 'Test Stück',
    };
    const createdStuecke = {
      stid: 1,
      name: 'Test Stück',
      genre: undefined,
      jahr: undefined,
      schwierigkeit: undefined,
      isdigitalisiert: undefined,
    };
    const formattedStuecke = {
      stid: 1,
      name: 'Test Stück',
      genre: undefined,
      jahr: undefined,
      schwierigkeit: undefined,
      isdigitalisiert: undefined,

    };
    prisma.stuecke.create = jest.fn().mockResolvedValue(createdStuecke);
    const result = await service.create(createStueckeDto);
    expect(result).toEqual(formattedStuecke);
  });

  it('should return all Stücke', async () => {
    const stueckeArray = [
      {
        stid: 1,
        name: 'Test Stück',
      },
    ];
    const formattedStueckeArray = [
      {
        stid: 1,
        name: 'Test Stück',
        genre: undefined,
        jahr: undefined,
        schwierigkeit: undefined,
        isdigitalisiert: undefined,
      },
    ];
    prisma.stuecke.findMany = jest.fn().mockResolvedValue(stueckeArray);
    const result = await service.findAll();
    expect(result).toEqual(formattedStueckeArray);
  });

  it('should return a Stück by ID', async () => {
    const stuecke = {
      stid: 1,
      name: 'Test Stück',
    };
    const formattedStuecke = {
      stid: 1,
      name: 'Test Stück',
      genre: undefined,
      jahr: undefined,
      schwierigkeit: undefined,
      isdigitalisiert: undefined,
    };
    prisma.stuecke.findUnique = jest.fn().mockResolvedValue(stuecke);
    const result = await service.findOne(1);
    expect(result).toEqual(formattedStuecke);
  });

  it('should throw NotFoundException if Stück not found', async () => {
    prisma.stuecke.findUnique = jest.fn().mockResolvedValue(null);
    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });

  it('should update a Stück by ID', async () => {
    const updateStueckeDto = {
      name: 'Updated Stück',
    };

    prisma.stuecke.findUnique = jest.fn().mockResolvedValue({
      stid: 1,
      name: 'Original Stück',
    });

    const updatedStuecke = {
      stid: 1,
      name: 'Updated Stück',
      genre: undefined,
      jahr: undefined,
      schwierigkeit: undefined,
      isdigitalisiert: undefined,
    };

    const expectedResult = {
      stid: 1,
      name: 'Updated Stück',
      genre: undefined,
      jahr: undefined,
      schwierigkeit: undefined,
      isdigitalisiert: undefined,
    };

    prisma.komponiert.deleteMany = jest.fn().mockResolvedValue({});
    prisma.arrangiert.deleteMany = jest.fn().mockResolvedValue({});
    prisma.stuecke.update = jest.fn().mockResolvedValue(updatedStuecke);

    const result = await service.update(1, updateStueckeDto);
    expect(result).toEqual(expectedResult);

  });

  it('should delete a Stück by ID', async () => {
    prisma.stuecke.delete = jest.fn().mockResolvedValue({ stid: 1 });
    const result = await service.remove(1);
    expect(result).toEqual({ stid: 1 });
  });

  it('should create a Stück with assigned composer and arranger', async () => {
    const createStueckeDto = {
      name: 'New Stück',
      genre: 'Classical',
      jahr: 2023,
      schwierigkeit: 'Medium',
      isdigitalisiert: true,
      komponiert: {
        create: [{ komid: 1 }, { komid: 2 }],
      },
      arrangiert: {
        create: [{ arrid: 1 }, { arrid: 2 }],
      },
    };

    const createdStuecke = {
      stid: 1,
      name: 'New Stück',
      genre: 'Classical',
      jahr: 2023,
      schwierigkeit: 'Medium',
      isdigitalisiert: true,
    };

    const expectedResult = {
      stid: 1,
      name: 'New Stück',
      genre: 'Classical',
      jahr: 2023,
      schwierigkeit: 'Medium',
      isdigitalisiert: true,
    };

    prisma.stuecke.create = jest.fn().mockResolvedValue(createdStuecke);

    const result = await service.create(createStueckeDto);
    expect(result).toEqual(expectedResult);
  });

  it('should create a missing person when creating a stueck', async () => {
    const createStueckeDto = {
      name: 'New Stück',
      genre: 'Classical',
      jahr: 2023,
      schwierigkeit: 'Medium',
      isdigitalisiert: true,
      komponiert: {
        create: [{ komid: 1 }, { komid: 2 }],
      },
      arrangiert: {
        create: [{ arrid: 1 }, { arrid: 2 }],
      },
    };

    const createdStuecke = {
      stid: 1,
      name: 'New Stück',
      genre: 'Classical',
      jahr: 2023,
      schwierigkeit: 'Medium',
      isdigitalisiert: true,
    };

    const expectedPerson = {
      name: 'Doe',
      vorname: 'John',
      id: 1,
    };

    prisma.stuecke.create = jest.fn().mockResolvedValue(createdStuecke);

    const result = await service.create(createStueckeDto);
    expect(result.komponiert[0]).toEqual(expectedPerson);
  });
});
