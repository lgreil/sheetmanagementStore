import { Test, TestingModule } from '@nestjs/testing';
import { StueckeController } from './stuecke.controller';

describe('StueckeController', () => {
  let controller: StueckeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StueckeController],
    }).compile();

    controller = module.get<StueckeController>(StueckeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
