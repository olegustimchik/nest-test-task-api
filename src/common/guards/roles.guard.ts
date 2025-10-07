import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Permissions } from '../decorators/permission.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permissions = this.reflector.get(Permissions, context.getHandler())
    if (!permissions) {
      return true
    }
    const request = context.switchToHttp().getRequest()
    const user = request.user
    console.log(user)
    console.log(permissions, user.user_role)
    if (!permissions.includes(user.user_role)) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      )
    }
    return true
  }
}
