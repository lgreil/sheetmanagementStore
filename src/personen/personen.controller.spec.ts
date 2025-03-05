import { Test, TestingModule } from '@nestjs/testing';
import { PersonenController } from './personen.controller';
import { PersonenService } from './personen.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PersonenController', () => {
  let controller: PersonenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonenController],
      providers: [PersonenService, PrismaService],
    }).compile();

    controller = module.get<PersonenController>(PersonenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

});