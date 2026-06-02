import { Controller, Get, Query } from '@nestjs/common';
import { InsagramService } from './insagram.service';
import { ApiQuery } from '@nestjs/swagger';

@Controller('insagram')
export class InsagramController {
  constructor(private readonly insagramService: InsagramService) {}

  @Get()
  @ApiQuery({ name: 'after', required: false, type: String })
  findAll(@Query('after') after?: string) {
    return this.insagramService.findAll(after);
  }
}
