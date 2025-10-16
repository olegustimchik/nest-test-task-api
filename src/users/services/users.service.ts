import {
  Injectable,
  ConflictException,
  NotFoundException,
  Inject,
} from '@nestjs/common'
import { and, eq, like } from 'drizzle-orm'
import { users, User } from '../../database/schema/user.schema'
import {
  CreateUserType,
  UpdateUserType,
  LoginType,
  UserFilterDto,
} from '../dto/user.dto'
import {
  DrizzleAsyncProvider,
  schema,
} from 'src/drizzleModule/drizzle.provider'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { HashService } from './hash.services'

@Injectable()
export class UsersService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase<typeof schema>,
    @Inject() private hashService: HashService,
  ) {}

  async create(userData: CreateUserType): Promise<User> {
    const hashedPassword = await this.hashService.hashPassword(
      userData.password,
      10,
    )
    const [newUser] = await this.db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning()

    return newUser
  }

  async findAll(filterData: UserFilterDto): Promise<User[]> {
    const allUsers = await this.db
      .select()
      .from(users)
      .where(
        and(
          filterData.name ? like(users.name, filterData.name) : undefined,
          filterData.isActive
            ? eq(users.isActive, filterData.isActive)
            : undefined,
        ),
      )
      .limit(filterData.limit)
      .offset(filterData.page ? (filterData.page - 1) * filterData.limit : 0)
    return allUsers
  }

  async findOne(id: string): Promise<User> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    return user || null
  }

  async blockUser(id: string, isActive: boolean): Promise<User> {
    const [user] = await this.db
      .update(users)
      .set({ isActive })
      .where(eq(users.id, id))
      .returning()
    return user
  }

  async update(id: string, updateData: UpdateUserType): Promise<User> {
    const existingUser = await this.findOne(id)

    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await this.findByEmail(updateData.email)
      if (emailExists) {
        throw new ConflictException('User with this email already exists')
      }
    }

    const [updatedUser] = await this.db
      .update(users)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning()

    return updatedUser
  }

  async remove(id: string): Promise<Array<User>> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    const result = await this.db
      .delete(users)
      .where(eq(users.id, id))
      .returning()
    return result
  }

  async validateUser(loginData: LoginType): Promise<User | null> {
    const user = await this.findByEmail(loginData.email)

    return user
  }
}
