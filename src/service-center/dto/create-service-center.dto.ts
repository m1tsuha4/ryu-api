import { createZodDto } from '@anatine/zod-nestjs';
import z from 'zod';

export const CreateServiceCenterSchema = z.object({
  name: z.string().min(1).max(255),
  address: z.string().min(1).max(500),
  phone: z.string().min(1).max(20),
  email: z.string().email().optional(),
});

export class CreateServiceCenterDto extends createZodDto(
  CreateServiceCenterSchema,
) {}
