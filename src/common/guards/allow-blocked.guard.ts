import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ActiveUser } from '../decorators/active-user.decorator'

@Injectable()
export class AllowBlockedGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check for decorator on both method and class level
    const activeFor = this.reflector.getAllAndOverride(ActiveUser, [
      context.getHandler(),
      context.getClass(),
    ])

    if (activeFor === undefined) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user

    if (!user) {
      return false
    }
    return user.isActive === activeFor
  }
}
