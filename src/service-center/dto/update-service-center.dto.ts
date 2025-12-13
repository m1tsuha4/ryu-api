import { CreateServiceCenterSchema } from './create-service-center.dto';
import { createZodDto } from '@anatine/zod-nestjs';

export const UpdateServiceCenterSchema = CreateServiceCenterSchema.partial();

export class UpdateServiceCenterDto extends createZodDto(
  UpdateServiceCenterSchema,
) {}
