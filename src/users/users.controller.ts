import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  BadRequestException,
  UseGuards,
  Query,
  Put,
} from '@nestjs/common'
import { UsersService } from './services/users.service'
import {
  CreateUserDto,
  UpdateUserDto,
  LoginDto,
  UserFilterDto,
} from './dto/user.dto'
import { UserToResponseDataMapper } from './data-mappers/user-to-response.data-mapper'
import { JwtService } from '@nestjs/jwt'
import { AuthGuard } from '@/jwt/auth.guard'
import { UserData } from '@/common/decorators/user-data.decorator'
import { User } from '@/database/schema/user.schema'
import { RolesGuard } from '@/common/guards/roles.guard'
import { Permissions } from '@/common/decorators/permission.decorator'
import { AllowBlockedGuard } from '@/common/guards/allow-blocked.guard'
import { ActiveUser } from '@/common/decorators/active-user.decorator'

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userToResponseDataMapper: UserToResponseDataMapper,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async create(@Body() createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findByEmail(
      createUserDto.email,
    )
    if (existingUser) {
      throw new BadRequestException('User with this email already exists')
    }
    const user = this.userToResponseDataMapper.toResponse(
      await this.usersService.create(createUserDto),
    )
    const token = await this.jwtService.signAsync({
      id: user.id,
      user_role: user.user_role,
    })
    return {
      success: true,
      message: 'User created successfully',
      data: user,
      token,
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email)

    if (!user) {
      throw new BadRequestException('This user does not exist')
    }

    if (!user.isActive) {
      throw new BadRequestException('This user is blocked')
    }

    const token = await this.jwtService.signAsync({
      id: user.id,
      user_role: user.user_role,
    })
    return {
      success: true,
      token,
    }
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard, AllowBlockedGuard)
  @Permissions(['user', 'admin'])
  @ActiveUser(true)
  async findAll(@Query() filterData: UserFilterDto) {
    console.log('filterData', filterData)
    const users = await this.usersService.findAll(filterData)
    console.log(users)
    const mappedUsers = users.map(user =>
      this.userToResponseDataMapper.toResponse(user),
    )
    return {
      success: true,
      message: 'Users retrieved successfully',
      data: mappedUsers,
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard, AllowBlockedGuard)
  @Permissions(['user', 'admin'])
  @ActiveUser(true)
  async findOne(@Param('id') id: string, @UserData() userData: User) {
    if (userData.user_role !== 'admin' && userData.id !== id) {
      throw new BadRequestException(
        'You do not have permission to view this user',
      )
    }
    const user = await this.usersService.findOne(id)
    const mappedUser = this.userToResponseDataMapper.toResponse(user)
    return {
      success: true,
      message: 'User retrieved successfully',
      data: mappedUser,
    }
  }

  @Put('block/:id')
  @UseGuards(AuthGuard, RolesGuard, AllowBlockedGuard)
  @Permissions(['admin'])
  @ActiveUser(true)
  async blockUser(@Param('id') id: string) {
    const user = await this.usersService.blockUser(id, false)
    return {
      success: true,
      message: 'User blocked successfully',
      data: this.userToResponseDataMapper.toResponse(user),
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard, AllowBlockedGuard)
  @Permissions(['user', 'admin'])
  @ActiveUser(true)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UserData() userData: User,
  ) {
    if (userData.user_role !== 'admin' && userData.id !== id) {
      throw new BadRequestException(
        'You do not have permission to view this user',
      )
    }
    const user = await this.usersService.update(id, updateUserDto)
    return {
      success: true,
      message: 'User updated successfully',
      data: user,
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard, RolesGuard, AllowBlockedGuard)
  @Permissions(['admin', 'user'])
  @ActiveUser(true)
  async remove(@Param('id') id: string, @UserData() userData: User) {
    if (userData.user_role !== 'admin' && userData.id !== id) {
      throw new BadRequestException(
        'You do not have permission to view this user',
      )
    }
    await this.usersService.remove(id)
    return {
      success: true,
      message: 'User deleted successfully',
    }
  }
}
