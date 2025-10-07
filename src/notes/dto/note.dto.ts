import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'
import { ApiProperty } from '@nestjs/swagger'

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
export class CreateNoteDto extends createZodDto(CreateNoteSchema) {
  @ApiProperty({
    description: 'Note title',
    example: 'My Important Note',
    minLength: 1,
    maxLength: 255,
  })
  title: string

  @ApiProperty({
    description: 'Note content',
    example: 'This is the content of my note.',
    required: false,
  })
  content?: string
}

export class UpdateNoteDto extends createZodDto(UpdateNoteSchema) {
  @ApiProperty({
    description: 'Note title',
    example: 'Updated Note Title',
    minLength: 1,
    maxLength: 255,
    required: false,
  })
  title?: string

  @ApiProperty({
    description: 'Note content',
    example: 'Updated note content.',
    required: false,
  })
  content?: string
}

export class NoteFilterDto extends createZodDto(NoteFilterSchema) {}

// Types
export type CreateNoteType = z.infer<typeof CreateNoteSchema>
export type UpdateNoteType = z.infer<typeof UpdateNoteSchema>
export type NoteFilterType = z.infer<typeof NoteFilterSchema>
