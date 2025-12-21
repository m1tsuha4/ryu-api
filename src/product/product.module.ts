import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CategoryModule } from 'src/category/category.module';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [PrismaModule, CategoryModule],
})
export class ProductModule {}
