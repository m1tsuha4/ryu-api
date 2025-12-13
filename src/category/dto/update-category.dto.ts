import { CreateCategorySchema } from './create-category.dto';
import { createZodDto } from '@anatine/zod-nestjs';

export const UpdateCategorySchema = CreateCategorySchema.partial();

export class UpdateCategoryDto extends createZodDto(UpdateCategorySchema) {}
