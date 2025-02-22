import { Test, TestingModule } from '@nestjs/testing';
import { PersonenController } from './personen.controller';

describe('PersonenController', () => {
  let controller: PersonenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonenController],
    }).compile();

    controller = module.get<PersonenController>(PersonenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
