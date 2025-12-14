import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import slugify from 'slugify';
import { basename, join } from 'path';
import { existsSync, unlinkSync } from 'fs';

@Injectable()
export class ArticleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createArticleDto: CreateArticleDto, file?: Express.Multer.File) {
    const slug =
      createArticleDto.slug ??
      slugify(createArticleDto.title, { lower: true, strict: true });

    const slugExists = await this.prisma.article.findUnique({
      where: { slug },
    });

    if (slugExists) {
      throw new BadRequestException('Slug already exists');
    }

    const primaryImage = file ? `/uploads/article/${file.filename}` : null;

    let metaTags: any = undefined;
    if (createArticleDto.metaTags) {
      try {
        metaTags =
          typeof createArticleDto.metaTags === 'string'
            ? JSON.parse(createArticleDto.metaTags)
            : createArticleDto.metaTags;
      } catch (error) {
        throw new BadRequestException('Invalid metaTags');
      }
    }
    return this.prisma.article.create({
      data: {
        title: createArticleDto.title,
        slug,
        excerpt: createArticleDto.excerpt,
        contentHtml: createArticleDto.contentHtml,
        seoTitle: createArticleDto.seoTitle,
        seoDescription: createArticleDto.seoDescription,
        author: createArticleDto.author,
        status: createArticleDto.status,
        publishedAt: createArticleDto.publishedAt,
        primaryImage,
        metaTags,
      },
    });
  }

  async findAll() {
    return await this.prisma.article.findMany({
      where: {
        deletedAt: null,
        status: 'PUBLISHED',
      },
      orderBy: {
        publishedAt: 'desc',
      },
    });
  }

  async findOneBySlug(slug: string) {
    const article = await this.prisma.article.findUnique({
      where: {
        slug,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        contentHtml: true,
        primaryImage: true,
        seoTitle: true,
        seoDescription: true,
        metaTags: true,
        author: true,
        status: true,
        publishedAt: true,
      },
    });

    if (!article) {
      throw new BadRequestException('Article not found');
    }

    return article;
  }

  async findOne(id: string) {
    const article = await this.prisma.article.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        contentHtml: true,
        primaryImage: true,
        seoTitle: true,
        seoDescription: true,
        metaTags: true,
        author: true,
        status: true,
        publishedAt: true,
      },
    });

    if (!article) {
      throw new BadRequestException('Article not found');
    }

    return article;
  }

  async update(
    id: string,
    updateArticleDto: UpdateArticleDto,
    file?: Express.Multer.File,
  ) {
    const existingArticle = await this.prisma.article.findUnique({
      where: {
        id,
      },
    });

    if (!existingArticle) {
      throw new BadRequestException('Article not found');
    }

    const { file: _ignoreFileField, ...rest } = updateArticleDto as any;
    const updateData: any = { ...rest };
    const uploadRoot = join(process.cwd(), 'uploads');
    if (file) {
      const primaryImage = `/uploads/article/${file.filename}`;
      updateData.primaryImage = primaryImage;

      if (
        existingArticle.primaryImage &&
        existingArticle.primaryImage.length > 0
      ) {
        const filename = basename(existingArticle.primaryImage);
        const filePath = join(uploadRoot, 'article', filename);
        try {
          if (existsSync(filePath)) {
            unlinkSync(filePath);
          }
        } catch (error) {
          console.error('Error deleting old article file:', error);
        }
      }
    }

    return this.prisma.article.update({
      where: {
        id,
      },
      data: updateData,
    });
  }

  async remove(id: string) {
    const existingArticle = await this.prisma.article.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingArticle) {
      throw new BadRequestException('Article not found');
    }

    return this.prisma.article.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async uploadImage(file: Express.Multer.File) {
    return this.prisma.imageArticle.create({
      data: {
        url: `/uploads/image-article/${file.filename}`,
      },
    });
  }

  async findAllImageArticle() {
    return this.prisma.imageArticle.findMany({
      select: {
        id: true,
        url: true,
      },
    });
  }
}
