import { Module } from '@nestjs/common';
import { ServiceCenterService } from './service-center.service';
import { ServiceCenterController } from './service-center.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [ServiceCenterController],
  providers: [ServiceCenterService],
  imports: [PrismaModule],
})
export class ServiceCenterModule {}
