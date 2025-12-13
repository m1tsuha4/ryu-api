import { createZodDto } from '@anatine/zod-nestjs';
import z from 'zod';

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  parentId: z.string().cuid().optional(),
});

export class CreateCategoryDto extends createZodDto(CreateCategorySchema) {}
