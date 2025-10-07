import { Reflector } from '@nestjs/core'
// import { userRolesEnum } from '@/database/schema/user.schema'

export const Permissions = Reflector.createDecorator<('admin' | 'user')[]>()
