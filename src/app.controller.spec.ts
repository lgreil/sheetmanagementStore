import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import StueckeService from './stuecke/stuecke.service';
import { CreateStueckeDto } from './stuecke/dto/create-stuecke.dto';
import { UpdateStueckeDto } from './stuecke/dto/update-stuecke.dto';

describe('AppController', () => {
  let appController: AppController;
  let stueckeService: StueckeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: StueckeService,
          useValue: {
            create: jest.fn().mockResolvedValue({}),
            findAll: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue({}),
            update: jest.fn().mockResolvedValue({}),
            remove: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    stueckeService = module.get<StueckeService>(StueckeService);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  describe('create', () => {
    it('should create a stuecke', async () => {
      const dto: CreateStueckeDto = {
        name: '',
      };
      await expect(appController.create(dto)).resolves.toEqual({});
    });
  });

  describe('findAll', () => {
    it('should return an array of stuecke', async () => {
      await expect(appController.findAll()).resolves.toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single stuecke', async () => {
      await expect(appController.findOne(1)).resolves.toEqual({});
    });
  });

  describe('update', () => {
    it('should update a stuecke', async () => {
      const dto: UpdateStueckeDto = {
        /* ...properties... */
      };
      await expect(appController.update(1, dto)).resolves.toEqual({});
    });
  });

  describe('remove', () => {
    it('should remove a stuecke', async () => {
      await expect(appController.remove(1)).resolves.toEqual({});
    });
  });
});
