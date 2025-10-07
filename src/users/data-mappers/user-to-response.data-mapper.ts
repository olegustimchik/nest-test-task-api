import { User } from '@/database/schema/user.schema'
import { Injectable } from '@nestjs/common'

@Injectable()
export class UserToResponseDataMapper {
  public toResponse(user: User): Omit<User, 'password'> {
    const { name, id, email, isActive, createdAt, updatedAt, user_role } = user
    return { name, id, email, isActive, createdAt, updatedAt, user_role }
  }
}
