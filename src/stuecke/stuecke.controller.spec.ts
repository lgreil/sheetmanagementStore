import { Test, TestingModule } from '@nestjs/testing';
import { StueckeController } from './stuecke.controller';
import StueckeService from './stuecke.service';
import { PrismaService } from '../prisma/prisma.service';

describe('StueckeController', () => {
  let controller: StueckeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StueckeController],
      providers: [StueckeService, PrismaService],
    }).compile();

    controller = module.get<StueckeController>(StueckeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
