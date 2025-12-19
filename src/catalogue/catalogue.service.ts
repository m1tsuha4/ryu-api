import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCatalogueDto } from './dto/create-catalogue.dto';
import { UpdateCatalogueDto } from './dto/update-catalogue.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { basename, join } from 'path';
import { existsSync, unlinkSync } from 'fs';

@Injectable()
export class CatalogueService {
  constructor(private readonly prisma: PrismaService) {}
  async create(
    createCatalogueDto: CreateCatalogueDto,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Catalogue PDF file is required');
    }

    const existingCatalogue = await this.prisma.catalogue.findFirst();
    if (existingCatalogue) {
      return this.update(existingCatalogue.id, createCatalogueDto, file);
    }

    return this.prisma.catalogue.create({
      data: {
        title: createCatalogueDto.title,
        fileUrl: `/uploads/catalogue/${file.filename}`,
      },
    });
  }

  async findAll() {
    const existingCatalogues = this.prisma.catalogue.findFirst({
      select: {
        id: true,
        title: true,
        fileUrl: true,
      },
    });
    return existingCatalogues;
  }

  async findOne(id: string) {
    const existingCatalogue = this.prisma.catalogue.findUnique({
      where: { id: id },
      select: {
        id: true,
        title: true,
        fileUrl: true,
      },
    });
    if (!existingCatalogue) {
      throw new BadRequestException('Catalogue not found');
    }
    return existingCatalogue;
  }

  async update(
    id: string,
    updateCatalogueDto: UpdateCatalogueDto,
    file?: Express.Multer.File,
  ) {
    const existingCatalogue = await this.prisma.catalogue.findUnique({
      where: { id: id },
    });
    if (!existingCatalogue) {
      throw new BadRequestException('Catalogue not found');
    }
    const { fileUrl, ...rest } = updateCatalogueDto as any;
    const updateData: any = { ...rest };
    const uploadRoot = join(process.cwd(), 'uploads');
    if (file) {
      const fileUrl = `/uploads/catalogue/${file.filename}`;
      updateData.fileUrl = fileUrl;

      if (existingCatalogue.fileUrl && existingCatalogue.fileUrl.length > 0) {
        const filename = basename(existingCatalogue.fileUrl);
        const filePath = join(uploadRoot, 'catalogue', filename);
        try {
          if (existsSync(filePath)) {
            unlinkSync(filePath);
          }
        } catch (error) {
          console.error('Error deleting old catalogue file:', error);
        }
      }
    }

    return this.prisma.catalogue.update({
      where: { id: id },
      data: updateData,
    });
  }

  async remove(id: string) {
    const existingCatalogue = await this.prisma.catalogue.findUnique({
      where: { id: id },
    });
    if (!existingCatalogue) {
      throw new BadRequestException('Catalogue not found');
    }

    const uploadRoot = join(process.cwd(), 'uploads');
    if (existingCatalogue.fileUrl && existingCatalogue.fileUrl.length > 0) {
      const filename = basename(existingCatalogue.fileUrl);
      const filePath = join(uploadRoot, 'catalogue', filename);
      try {
        if (existsSync(filePath)) {
          unlinkSync(filePath);
        }
      } catch (error) {
        console.error('Error deleting catalogue file:', error);
      }
    }

    return this.prisma.catalogue.delete({
      where: { id: id },
    });
  }
}
