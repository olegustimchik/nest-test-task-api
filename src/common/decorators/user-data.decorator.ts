import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { User } from '@/database/schema/user.schema'

export const UserData = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest()

    return request.user satisfies User
  },
)
