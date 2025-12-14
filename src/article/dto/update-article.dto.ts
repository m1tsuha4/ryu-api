import { CreateArticleSchmea } from './create-article.dto';
import { createZodDto } from '@anatine/zod-nestjs';

export const UpdateArticleSchmea = CreateArticleSchmea.partial();

export class UpdateArticleDto extends createZodDto(UpdateArticleSchmea) {}
