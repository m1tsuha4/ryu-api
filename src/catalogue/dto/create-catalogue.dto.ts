import { createZodDto } from "@anatine/zod-nestjs";
import z from "zod";

export const CreateCatalogueSchema = z.object({
    title: z.string().optional(),
    fileUrl: z.string().optional(),
});

export class CreateCatalogueDto extends createZodDto(CreateCatalogueSchema) {}
