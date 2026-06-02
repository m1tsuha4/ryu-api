import { Test, TestingModule } from '@nestjs/testing';
import { InsagramController } from './insagram.controller';
import { InsagramService } from './insagram.service';

describe('InsagramController', () => {
  let controller: InsagramController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InsagramController],
      providers: [InsagramService],
    }).compile();

    controller = module.get<InsagramController>(InsagramController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
