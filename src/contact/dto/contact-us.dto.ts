import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const ContactUsSchema = z.object({
    contact_type: z.string().min(1),
    name: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email(),
    city: z.string().min(1),
    message: z.string().min(1),
});

export class ContactUsDto extends createZodDto(ContactUsSchema) { }
