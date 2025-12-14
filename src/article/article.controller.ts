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
        title: { type: 'string' },
        excerpt: { type: 'string' },
        contentHtml: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        },
        seoTitle: { type: 'string' },
        seoDescription: { type: 'string' },
        metaTags: { type: 'string' },
        author: { type: 'string' },
        status: { type: 'string' },
        publishedAt: { type: 'string' },
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
        metaTags: { type: 'string' },
        author: { type: 'string' },
        status: { type: 'string' },
        publishedAt: { type: 'string' },
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
}
