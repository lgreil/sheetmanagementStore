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

  it('should create a new Stück with composers and arrangers', async () => {
    // Mock person resolution
    const createStueckeDto = {
      name: 'Test Stück',
      composerIds: [1],
      arrangerIds: [2]
    };

    const createdStuecke = {
      stid: 1,
      name: 'Test Stück',
      genre: undefined,
      Jahr: undefined,
      schwierigkeit: undefined,
      isdigitalisiert: undefined,
      komponiert: [{ person: { pid: 1 } }],
      arrangiert: [{ person: { pid: 2 } }],
    };

    const formattedStuecke = {
      stid: 1,
      name: 'Test Stück',
      genre: undefined,
      Jahr: undefined,
      schwierigkeit: undefined,
      isdigitalisiert: undefined,
      composer_ids: [1],
      arranger_ids: [2],
    };

    // Setup mock for create method
    prisma.stuecke.create = jest.fn().mockResolvedValue(createdStuecke);

    // Create the Stück
    const result = await service.create(createStueckeDto);

    // Assertions
    expect(result).toEqual(formattedStuecke);
    expect(prisma.stuecke.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        name: 'Test Stück',
        komponiert: expect.any(Object),
        arrangiert: expect.any(Object)
      })
    }));
  });

  it('should update a Stück with composers and arrangers', async () => {
    const updateStueckeDto = {
      name: 'Updated Stück',
      composerIds: [1],
      arrangerIds: [2]
    };

    // Mock the findUnique to simulate existing record
    prisma.stuecke.findUnique = jest.fn().mockResolvedValue({
      stid: 1,
      name: 'Original Stück'
    });

    // Simulate the full update process
    const updatedStuecke = {
      stid: 1,
      name: 'Updated Stück',
      komponiert: [{ person: { pid: 1 } }],
      arrangiert: [{ person: { pid: 2 } }],
      genre: undefined,
      Jahr: undefined,
      schwierigkeit: undefined,
      isdigitalisiert: undefined,
    };

    const expectedResult = {
      stid: 1,
      name: 'Updated Stück',
      genre: undefined,
      Jahr: undefined,
      schwierigkeit: undefined,
      isdigitalisiert: undefined,
      composer_ids: [1],
      arranger_ids: [2],
    };

    // Mock the necessary Prisma methods
    prisma.komponiert.deleteMany = jest.fn().mockResolvedValue({});
    prisma.arrangiert.deleteMany = jest.fn().mockResolvedValue({});
    prisma.stuecke.update = jest.fn().mockResolvedValue(updatedStuecke);

    const result = await service.update(1, updateStueckeDto);
    expect(result).toEqual(expectedResult);
  });


  it('should handle creating a person if not exists', async () => {
    // Mock person upsert to create a new person
    prisma.person.upsert = jest.fn().mockImplementation(async (args) => ({
      pid: 1,
      name: args.where.name_vorname_unique.name,
      vorname: args.where.name_vorname_unique.vorname
    }));

    // Manually test the resolvePersons method
    const resolvePersons = (resolvePersonsInterceptor as any).resolvePersons.bind(resolvePersonsInterceptor);

    const personIds = await resolvePersons(['Ludwig van Beethoven']);

    expect(personIds).toEqual([1]);
    expect(prisma.person.upsert).toHaveBeenCalledWith({
      where: { name_vorname_unique: { name: 'Beethoven', vorname: 'Ludwig van' } },
      update: {},
      create: { name: 'Beethoven', vorname: 'Ludwig van' }
    });
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
    const stueckeArray = [
      {
        stid: 1,
        name: 'Test Stück',
        komponiert: [{ person: { pid: 1 } }],
        arrangiert: [{ person: { pid: 2 } }],
      }
    ];
    const formattedStueckeArray = [
      {
        stid: 1,
        name: 'Test Stück',
        genre: undefined,
        jahr: undefined,
        schwierigkeit: undefined,
        isdigitalisiert: undefined,
        composer_ids: [1],
        arranger_ids: [2],
      }
    ];
    prisma.stuecke.findMany = jest.fn().mockResolvedValue(stueckeArray);
    const result = await service.findAll();
    expect(result).toEqual(formattedStueckeArray);
  });

  it('should return a Stück by ID', async () => {
    const stuecke = {
      stid: 1,
      name: 'Test Stück',
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
    prisma.stuecke.findUnique = jest.fn().mockResolvedValue(stuecke);
    const result = await service.findOne(1);
    expect(result).toEqual(formattedStuecke);
  });

  it('should throw NotFoundException if Stück not found', async () => {
    prisma.stuecke.findUnique = jest.fn().mockResolvedValue(null);
    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });

  it('should update a Stück by ID and set Composer and Arranger correctly', async () => {
    const updateStueckeDto = {
      name: 'Updated Stück',
      composerIds: [1],
      arrangerIds: [2]
    };

    // Mock the findUnique to simulate existing record
    prisma.stuecke.findUnique = jest.fn().mockResolvedValue({
      stid: 1,
      name: 'Original Stück'
    });

    // Simulate the full update process
    const updatedStuecke = {
      stid: 1,
      name: 'Updated Stück',
      komponiert: [{ person: { pid: 1 } }],
      arrangiert: [{ person: { pid: 2 } }],
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
      composer_ids: [1],
      arranger_ids: [2],
    };

    // Mock the necessary Prisma methods
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
});