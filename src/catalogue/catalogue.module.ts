import { Module } from '@nestjs/common';
import { CatalogueService } from './catalogue.service';
import { CatalogueController } from './catalogue.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [CatalogueController],
  providers: [CatalogueService],
  imports: [PrismaModule],
})
export class CatalogueModule {}
