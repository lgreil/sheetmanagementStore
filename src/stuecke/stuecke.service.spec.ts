import { Test, TestingModule } from '@nestjs/testing';
import { StueckeService } from './stuecke.service';

describe('StueckeService', () => {
  let service: StueckeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StueckeService],
    }).compile();

    service = module.get<StueckeService>(StueckeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
