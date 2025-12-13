import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import slugify from 'slugify';
import { basename, join } from 'path';
import { existsSync, unlinkSync } from 'fs';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}
  async create(
    createProductDto: CreateProductDto,
    files?: Express.Multer.File[],
  ) {
    const slug =
      createProductDto.slug ??
      slugify(createProductDto.name, { lower: true, strict: true });
    const slugExist = await this.prisma.product.findUnique({
      where: {
        slug: slug,
      },
    });
    if (slugExist) {
      throw new BadRequestException(
        'Product with the same slug already exists',
      );
    }

    const rawCategoryIds: unknown = createProductDto.categoryIds;
    const categoryIds = Array.isArray(rawCategoryIds)
      ? rawCategoryIds
      : typeof rawCategoryIds === 'string'
        ? rawCategoryIds.split(',').map((id) => id.trim())
        : [];
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: createProductDto.name,
          slug: slug,
          description: createProductDto.description,
          storeUrl: createProductDto.storeUrl,
          productCategory: {
            create: categoryIds.map((id) => ({
              categoryId: id,
            })),
          },
        },
      });

      if (files?.length) {
        await tx.productImage.createMany({
          data: files.map((file) => ({
            productId: product.id,
            url: `/uploads/product/${file.filename}`,
          })),
        });
      }
      return product;
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        storeUrl: true,
        productImages: {
          select: {
            url: true,
          },
        },
      },
    });
  }

  async findLatest() {
    return this.prisma.product.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 6,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        storeUrl: true,
        productImages: {
          select: {
            url: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
    if (!product) {
      throw new BadRequestException('Product not found');
    }
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    files?: Express.Multer.File[],
  ) {
    const productExist = await this.prisma.product.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        productImages: true,
      },
    });

    if (!productExist) {
      throw new BadRequestException('Product not found');
    }

    const slug =
      updateProductDto.slug ??
      (updateProductDto.name
        ? slugify(updateProductDto.name, { lower: true, strict: true })
        : productExist.slug);
    if (slug !== productExist.slug) {
      const slugExist = await this.prisma.product.findUnique({
        where: { slug },
      });
      if (slugExist) {
        throw new BadRequestException(
          'Product with the same slug already exists',
        );
      }
    }

    const uploadRoot = join(process.cwd(), 'uploads', 'product');

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data: {
          name: updateProductDto.name ?? productExist.name,
          slug,
          description: updateProductDto.description ?? productExist.description,
          storeUrl: updateProductDto.storeUrl ?? productExist.storeUrl,
        },
      });

      if (files?.length) {
        for (const img of productExist.productImages) {
          try {
            const fileName = basename(img.url);
            const oldPath = join(uploadRoot, fileName);
            if (existsSync(oldPath)) {
              unlinkSync(oldPath);
            }
          } catch (error) {
            console.error('Error deleting file:', error);
          }
        }

        await this.prisma.productImage.deleteMany({
          where: {
            productId: id,
          },
        });

        await tx.productImage.createMany({
          data: files.map((file) => ({
            productId: id,
            url: `/uploads/product/${file.filename}`,
          })),
        });
      }

      const rawCategoryIds: unknown = updateProductDto.categoryIds;

      const categoryIds = Array.isArray(rawCategoryIds)
        ? rawCategoryIds
        : typeof rawCategoryIds === 'string'
          ? rawCategoryIds.split(',').map((id) => id.trim())
          : [];

      if (categoryIds?.length) {
        await tx.productCategory.deleteMany({
          where: {
            productId: id,
          },
        });

        await tx.productCategory.createMany({
          data: categoryIds.map((categoryId) => ({
            productId: id,
            categoryId,
          })),
        });
      }

      return product;
    });
  }

  async remove(id: string) {
    const productExist = await this.prisma.product.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        productImages: true,
      },
    });

    if (!productExist) {
      throw new BadRequestException('Product not found');
    }

    const uploadRoot = join(process.cwd(), 'uploads', 'product');

    return this.prisma.$transaction(async (tx) => {
      for (const img of productExist.productImages) {
        try {
          const fileName = basename(img.url);
          const oldPath = join(uploadRoot, fileName);
          if (existsSync(oldPath)) {
            unlinkSync(oldPath);
          }
        } catch (error) {
          console.error('Error deleting file:', error);
        }
      }

      await tx.productImage.deleteMany({
        where: {
          productId: id,
        },
      });

      return tx.product.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    });
  }
}
