import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UploadedFiles,
} from '@nestjs/common';
import { ProductService } from './product.service';
import {
  CreateProductDto,
  CreateProductSchema,
} from './dto/create-product.dto';
import {
  UpdateProductDto,
  UpdateProductSchema,
} from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-guard.auth';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { UploadImagesInterceptor } from 'src/common/interceptors/multer-config.interceptors';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { file } from 'zod/v4';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UploadImagesInterceptor('product', 5)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        storeUrl: { type: 'string' },
        categoryIds: {
          type: 'array',
          items: { type: 'string' },
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      required: ['name'],
    },
  })
  @Post()
  create(
    @Body(new ZodValidationPipe(CreateProductSchema))
    createProductDto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productService.create(createProductDto, files);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get('latest')
  findLatest() {
    return this.productService.findLatest();
  }

  @Get('search/:query')
  search(@Param('query') query: string) {
    return this.productService.search(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UploadImagesInterceptor('product')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        storeUrl: { type: 'string' },
        categoryIds: {
          type: 'array',
          items: { type: 'string' },
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateProductSchema))
    updateProductDto: UpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productService.update(id, updateProductDto, files);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
