import { Test, TestingModule } from '@nestjs/testing';
import { InsagramService } from './insagram.service';

describe('InsagramService', () => {
  let service: InsagramService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InsagramService],
    }).compile();

    service = module.get<InsagramService>(InsagramService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
