import { Module } from '@nestjs/common';
import { InsagramService } from './insagram.service';
import { InsagramController } from './insagram.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [InsagramController],
  providers: [InsagramService],
})
export class InsagramModule {}
