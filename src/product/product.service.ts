import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import slugify from 'slugify';
import { basename, join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { CategoryService } from 'src/category/category.service';
import { CategoryPath, findCategoryPath } from 'src/category/util';
import { boolean } from 'zod/v4';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoryService: CategoryService,
  ) {}
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
        productCategory: {
          select: {
            categoryId: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
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
        productCategory: {
          select: {
            categoryId: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        productImages: {
          select: {
            url: true,
          },
        },
      },
    });
  }

  async search(query: string) {
    return this.prisma.product.findMany({
      where: {
        deletedAt: null,
        name: {
          contains: query,
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        storeUrl: true,
        productCategory: {
          select: {
            categoryId: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
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
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        storeUrl: true,
        productCategory: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        productImages: {
          select: {
            url: true,
          },
        },
      },
    });
    if (!product) {
      throw new BadRequestException('Product not found');
    }

    const categoryTree = await this.categoryService.getCategoryTree();

    const categories = product.productCategory
      .map((pc) => findCategoryPath(categoryTree, pc.category.id))
      .filter(Boolean);

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      storeUrl: product.storeUrl,
      images: product.productImages,
      categories,
    };
  }

  async findOneBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        slug,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        storeUrl: true,
        productCategory: {
          select: {
            categoryId: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        productImages: {
          select: {
            url: true,
          },
        },
      },
    });
    if (!product) {
      throw new BadRequestException('Product not found');
    }
    return product;
  }

  async getCategoryAndChildrenIds(categoryId: string): Promise<string[]> {
    const categories = await this.prisma.category.findMany({
      where: { deletedAt: null },
      select: { id: true, parentId: true },
    });

    const result: string[] = [];

    function walk(id: string) {
      result.push(id);

      categories.filter((c) => c.parentId === id).forEach((c) => walk(c.id));
    }

    walk(categoryId);
    return result;
  }

  async getProductByCategoryId(categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        deletedAt: null,
      },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    const ids = await this.getCategoryAndChildrenIds(category.id);

    return this.prisma.product.findMany({
      where: {
        deletedAt: null,
        productCategory: {
          some: {
            categoryId: {
              in: ids,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        storeUrl: true,
        productCategory: {
          select: {
            categoryId: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        productImages: {
          select: {
            url: true,
          },
        },
      },
    });
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
