import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UploadedFile,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import {
  CreateArticleDto,
  CreateArticleSchmea,
} from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-guard.auth';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { UploadImageInterceptor } from 'src/common/interceptors/multer-config.interceptors';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UploadImageInterceptor('article')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Power Tools Andal untuk Pekerjaan dan Kebutuhan Sehari-hari - RYU'},
        excerpt: { type: 'string', example: 'Power Tools Andal untuk Pekerjaan dan Kebutuhan Sehari-hari - RYU' },
        contentHtml: { type: 'string', example: '<p>Power Tools Andal untuk Pekerjaan dan Kebutuhan Sehari-hari - RYU</p>' },
        file: {
          type: 'string',
          format: 'binary',
        },
        seoTitle: { type: 'string', example: 'Power Tools Andal untuk Pekerjaan dan Kebutuhan Sehari-hari - RYU' },
        seoDescription: { type: 'string', example: 'Power Tools Andal untuk Pekerjaan dan Kebutuhan Sehari-hari - RYU' },
        metaTags: { type: 'object', example: 
          {
            title: 'Power Tools Andal untuk Pekerjaan dan Kebutuhan Sehari-hari - RYU',
            description: 'Power Tools Andal untuk Pekerjaan dan Kebutuhan Sehari-hari - RYU',
            keywords: 'Power Tools'
          }
        },
        author: { type: 'string', example: 'RYU' },
        status: { type: 'string', example: 'PUBLISHED' },
        publishedAt: { type: 'date', example: '2025-12-18T08:02:45.000Z' },
      },
    },
  })
  @Post()
  create(
    @Body(new ZodValidationPipe(CreateArticleSchmea))
    createArticleDto: CreateArticleDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.articleService.create(createArticleDto, file);
  }

  @Get()
  findAll() {
    return this.articleService.findAll();
  }

  @Get('image-article')
  findAllImageArticle() {
    return this.articleService.findAllImageArticle();
  }

  @Get('slug/:slug')
  findOneBySlug(@Param('slug') slug: string) {
    return this.articleService.findOneBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articleService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UploadImageInterceptor('article')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        excerpt: { type: 'string' },
        contentHtml: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        },
        seoTitle: { type: 'string' },
        seoDescription: { type: 'string' },
        metaTags: { type: 'object' },
        author: { type: 'string' },
        status: { type: 'string' },
        publishedAt: { type: 'date' },
      },
    },
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.articleService.update(id, updateArticleDto, file);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.articleService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UploadImageInterceptor('image-article')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('upload-image')
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.articleService.uploadImage(file);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('image-article/:id')
  removeImageArticle(@Param('id') id: string) {
    return this.articleService.removeImageArticle(id);
  }
}
