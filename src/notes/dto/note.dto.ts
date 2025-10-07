import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

export const NoteFilterSchema = z.object({
  page: z
    .string()
    .or(z.number())
    .optional()
    .default('1')
    .transform(val => {
      const num = typeof val === 'string' ? parseInt(val, 10) : val
      return isNaN(num) ? 1 : num
    })
    .refine(val => val >= 1, {
      message: 'Page must be greater than or equal to 1',
    }),
  limit: z
    .string()
    .or(z.number())
    .optional()
    .default('10')
    .transform(val => {
      const num = typeof val === 'string' ? parseInt(val, 10) : val
      return isNaN(num) ? 10 : num
    })
    .refine(val => val >= 1 && val <= 100, {
      message: 'Limit must be between 1 and 100',
    }),
})

export const CreateNoteSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
    content: z.string().optional(),
  })
  .required()

export const UpdateNoteSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title too long')
    .optional(),
  content: z.string().optional(),
})

// DTOs using nestjs-zod
export class CreateNoteDto extends createZodDto(CreateNoteSchema) {}
export class UpdateNoteDto extends createZodDto(UpdateNoteSchema) {}
export class NoteFilterDto extends createZodDto(NoteFilterSchema) {}
// Types
export type CreateNoteType = z.infer<typeof CreateNoteSchema>
export type UpdateNoteType = z.infer<typeof UpdateNoteSchema>
export type NoteFilterType = z.infer<typeof NoteFilterSchema>
