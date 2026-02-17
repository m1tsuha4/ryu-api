import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const ContactEventSchema = z.object({
    event_type: z.string().min(1),
    name: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email(),
    city: z.string().min(1),
    message: z.string().min(1),
});

export class ContactEventDto extends createZodDto(ContactEventSchema) { }
