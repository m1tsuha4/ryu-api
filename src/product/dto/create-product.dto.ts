import { createZodDto } from '@anatine/zod-nestjs';
import z from 'zod';

export const CreateProductSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).optional(),
  description: z.string().max(1000),
  storeUrl: z.string().url(),
  categoryIds: z
    .preprocess(
      (val) => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') return [val];
        return [];
      },
      z.array(z.string().cuid()),
    )
    .optional(),
});

export class CreateProductDto extends createZodDto(CreateProductSchema) {}
