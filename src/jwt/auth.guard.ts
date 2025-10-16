import { SkipAuth } from '@/common/decorators/skip.decorator'
import { UsersService } from '@/users/services/users.service'
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const skipAuth = this.reflector.getAllAndOverride<boolean>(SkipAuth, [
      context.getHandler(),
      context.getClass(),
    ])
    if (skipAuth) {
      return true
    }

    const token = this.extractTokenFromHeader(request)
    if (!token) {
      throw new UnauthorizedException()
    }
    try {
      const payload = await this.jwtService.verifyAsync(token)
      const user = await this.userService.findOne(payload.id)
      if (!user) {
        throw new UnauthorizedException("User doesn't exist")
      }
      const { id, user_role, updatedAt, createdAt, isActive, email } = user
      request.user = { id, user_role, updatedAt, createdAt, isActive, email }
    } catch {
      throw new UnauthorizedException()
    }

    return true
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []

    return type === 'Bearer' ? token : undefined
  }
}
