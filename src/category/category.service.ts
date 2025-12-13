import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import slugify from 'slugify';
import { join, basename } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { CategoryNode } from './util';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}
  async create(
    createCategoryDto: CreateCategoryDto,
    file?: Express.Multer.File,
  ) {
    const existingCategory = await this.prisma.category.findFirst({
      where: {
        name: createCategoryDto.name,
        parentId: createCategoryDto.parentId || null,
      },
    });
    if (existingCategory) {
      throw new BadRequestException(
        'Category with the same name already exists under the same parent',
      );
    }
    const slug =
      createCategoryDto.slug ??
      slugify(createCategoryDto.name, { lower: true, strict: true });
    const slugExists = await this.prisma.category.findUnique({
      where: {
        slug: slug,
      },
    });
    if (slugExists) {
      throw new BadRequestException(
        'Category with the same slug already exists',
      );
    }
    const image = file ? `/uploads/category/${file.filename}` : null;
    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        slug: slug,
        imageUrl: image,
      },
    });
  }

  async getCategoryTree() {
    const categories = await this.prisma.category.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        imageUrl: true,
        description: true,
      },
    });

    const map: Record<string, CategoryNode> = {};
    const tree: CategoryNode[] = [];

    for (const cat of categories) {
      map[cat.id] = { ...cat, children: [] };
    }
    for (const cat of categories) {
      if (cat.parentId && map[cat.parentId]) {
        map[cat.parentId].children.push(map[cat.id]);
      } else {
        tree.push(map[cat.id]);
      }
    }

    return tree;
  }

  async getCategoryBySlug(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug, deletedAt: null },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        parentId: true,
        imageUrl: true,
      },
    });
  }

  async findAll() {
    const categoryExists = await this.prisma.category.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        parentId: true,
        imageUrl: true,
      },
    });
    if (categoryExists.length === 0) {
      throw new BadRequestException('No categories found');
    }
    return categoryExists;
  }

  async findOne(id: string) {
    const categoryExist = await this.prisma.category.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        parentId: true,
        imageUrl: true,
      },
    });
    if (!categoryExist) {
      throw new BadRequestException('Category not found');
    }
    return categoryExist;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    file?: Express.Multer.File,
  ) {
    const categoryExist = await this.prisma.category.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
    if (!categoryExist) {
      throw new BadRequestException('Category not found');
    }

    const slug =
      updateCategoryDto.slug ??
      (updateCategoryDto.name
        ? slugify(updateCategoryDto.name, { lower: true, strict: true })
        : categoryExist.slug);
    if (slug !== categoryExist.slug) {
      const slugExists = await this.prisma.category.findUnique({
        where: {
          slug: slug,
        },
      });
      if (slugExists) {
        throw new BadRequestException(
          'Category with the same slug already exists',
        );
      }
    }

    const { file: _ignoreFileField, ...rest } = updateCategoryDto as any;
    const updateData: any = { ...rest, slug };
    const uploadRoot = join(process.cwd(), 'uploads', 'category');
    let image: string | undefined;

    if (file) {
      image = `/uploads/category/${file.filename}`;
      updateData.imageUrl = image;

      if (categoryExist.imageUrl) {
        const fileName = basename(categoryExist.imageUrl);
        const oldFilePath = join(uploadRoot, 'category', fileName);
        try {
          if (existsSync(oldFilePath)) {
            unlinkSync(oldFilePath);
          }
        } catch (error) {
          console.error('Error deleting old image file:', error);
        }
      }
      return this.prisma.category.update({
        where: { id },
        data: updateData,
      });
    }
  }

  async remove(id: string) {
    const existingCategory = await this.prisma.category.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingCategory) {
      throw new BadRequestException('Category not found');
    }

    const uploadRoot = join(process.cwd(), 'uploads', 'category');

    if (existingCategory.imageUrl) {
      const fileName = basename(existingCategory.imageUrl);
      const oldFilePath = join(uploadRoot, 'category', fileName);
      try {
        if (existsSync(oldFilePath)) {
          unlinkSync(oldFilePath);
        }
      } catch (error) {
        console.error('Error deleting image file:', error);
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
