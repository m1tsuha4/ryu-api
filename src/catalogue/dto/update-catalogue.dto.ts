import { CreateCatalogueSchema } from './create-catalogue.dto';
import { createZodDto } from '@anatine/zod-nestjs';

export const UpdateCatalogueSchema = CreateCatalogueSchema.partial();

export class UpdateCatalogueDto extends createZodDto(UpdateCatalogueSchema) {}
