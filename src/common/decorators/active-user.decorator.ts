import { Reflector } from '@nestjs/core'

export const ActiveUser = Reflector.createDecorator<boolean>()
