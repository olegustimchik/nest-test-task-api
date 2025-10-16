import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common'
import { UsersService } from '@/users/services/users.service'

@Injectable()
export class UsersRuleGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const { id } = request.params

    if (!id) {
      return false
    }
    const user = request.user

    if (!user) {
      return false
    }
    if (user.user_role !== 'admin' && user.id !== id) {
      throw new BadRequestException(
        'You do not have permission to access this resource',
      )
    }

    return user.id === id || user.user_role === 'admin'
  }
}
