import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

export const UserFilterSchema = z.object({
  isActive: z
    .string()
    .optional()
    .transform(val => {
      if (val === undefined) return undefined
      return val === 'true' || val === '1'
    }),
  name: z.string().optional(),
  page: z
    .string()
    .default('1')
    .transform(val => parseInt(val, 10)),
  limit: z
    .string()
    .default('10')
    .transform(val => parseInt(val, 10)),
})

// User validation schemas
export const CreateUserSchema = z.object({
  email: z.email('Invalid email format'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name too long'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password too long'),
})

export const UpdateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name too long')
    .optional(),
  email: z.email('Invalid email format').optional(),
})

export const LoginSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

// DTOs using nestjs-zod
export class CreateUserDto extends createZodDto(CreateUserSchema) {}
export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
export class LoginDto extends createZodDto(LoginSchema) {}
export class UserFilterDto extends createZodDto(UserFilterSchema) {}

// Types
export type CreateUserType = z.infer<typeof CreateUserSchema>
export type UpdateUserType = z.infer<typeof UpdateUserSchema>
export type LoginType = z.infer<typeof LoginSchema>
export type UserFilterType = z.infer<typeof UserFilterSchema>
