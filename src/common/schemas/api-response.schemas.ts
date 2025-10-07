import { ApiProperty } from '@nestjs/swagger'

export class ApiSuccessResponse<T = any> {
  @ApiProperty({ example: true })
  success: boolean

  @ApiProperty({ example: 'Operation completed successfully' })
  message: string

  @ApiProperty()
  data?: T
}

export class ApiErrorResponse {
  @ApiProperty({ example: false })
  success: boolean

  @ApiProperty({ example: 'Error message' })
  message: string

  @ApiProperty({ required: false })
  error?: string
}

export class UserResponseSchema {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty({ format: 'email' })
  email: string

  @ApiProperty()
  name: string

  @ApiProperty({ enum: ['user', 'admin'] })
  user_role: string

  @ApiProperty()
  isActive: boolean

  @ApiProperty({ format: 'date-time' })
  createdAt: string

  @ApiProperty({ format: 'date-time' })
  updatedAt: string
}

export class NoteResponseSchema {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty()
  title: string

  @ApiProperty({ required: false })
  content?: string

  @ApiProperty({ format: 'uuid' })
  userId: string

  @ApiProperty({ format: 'date-time' })
  createdAt: string

  @ApiProperty({ format: 'date-time' })
  updatedAt: string
}

export class LoginResponseSchema {
  @ApiProperty({ example: true })
  success: boolean

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  token: string
}

export class CreateUserResponseSchema extends ApiSuccessResponse {
  @ApiProperty()
  data: UserResponseSchema

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  token: string
}
