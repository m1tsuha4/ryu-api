import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ServiceCenterService } from './service-center.service';
import {
  CreateServiceCenterDto,
  CreateServiceCenterSchema,
} from './dto/create-service-center.dto';
import {
  UpdateServiceCenterDto,
  UpdateServiceCenterSchema,
} from './dto/update-service-center.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-guard.auth';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';

@Controller('service-center')
export class ServiceCenterController {
  constructor(private readonly serviceCenterService: ServiceCenterService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  create(
    @Body(new ZodValidationPipe(CreateServiceCenterSchema))
    createServiceCenterDto: CreateServiceCenterDto,
  ) {
    return this.serviceCenterService.create(createServiceCenterDto);
  }

  @Get()
  findAll() {
    return this.serviceCenterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceCenterService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateServiceCenterSchema))
    updateServiceCenterDto: UpdateServiceCenterDto,
  ) {
    return this.serviceCenterService.update(id, updateServiceCenterDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceCenterService.remove(id);
  }
}
