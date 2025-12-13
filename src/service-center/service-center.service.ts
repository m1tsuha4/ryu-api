import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateServiceCenterDto } from './dto/create-service-center.dto';
import { UpdateServiceCenterDto } from './dto/update-service-center.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ServiceCenterService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createServiceCenterDto: CreateServiceCenterDto) {
    return this.prisma.serviceCenter.create({
      data: createServiceCenterDto,
    });
  }

  async findAll() {
    const existingServiceCenters = await this.prisma.serviceCenter.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        email: true,
      },
    });
    return existingServiceCenters;
  }

  async findOne(id: string) {
    const existingServiceCenter = await this.prisma.serviceCenter.findUnique({
      where: { id: id },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        email: true,
      },
    });
    if (!existingServiceCenter) {
      throw new BadRequestException('Service Center not found');
    }
    return existingServiceCenter;
  }

  async update(id: string, updateServiceCenterDto: UpdateServiceCenterDto) {
    const existingServiceCenter = await this.prisma.serviceCenter.findUnique({
      where: { id: id },
    });
    if (!existingServiceCenter) {
      throw new BadRequestException('Service Center not found');
    }
    return this.prisma.serviceCenter.update({
      where: { id: id },
      data: updateServiceCenterDto,
    });
  }

  async remove(id: string) {
    const existingServiceCenter = await this.prisma.serviceCenter.findUnique({
      where: { id: id },
    });
    if (!existingServiceCenter) {
      throw new BadRequestException('Service Center not found');
    }
    return this.prisma.serviceCenter.delete({
      where: { id: id },
    });
  }
}
