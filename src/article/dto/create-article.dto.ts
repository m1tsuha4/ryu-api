import { createZodDto } from '@anatine/zod-nestjs';
import z from 'zod';

export const CreateArticleSchmea = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  contentHtml: z.string(),
  primaryImage: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  metaTags: z.string().optional().transform((val) => (val ? JSON.parse(val) : undefined)),
  author: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  publishedAt: z.date().optional(),
});

export class CreateArticleDto extends createZodDto(CreateArticleSchmea) {}
