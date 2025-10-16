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
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger'
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

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userToResponseDataMapper: UserToResponseDataMapper,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account with email, name and password. Returns user data and JWT token.',
  })
  @ApiCreatedResponse({
    description: 'User created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User created successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            user_role: { type: 'string', enum: ['user', 'admin'] },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'User with this email already exists or validation failed',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: {
          type: 'string',
          example: 'User with this email already exists',
        },
      },
    },
  })
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
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticates a user with email and password. Returns JWT token.',
  })
  @ApiOkResponse({
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'User does not exist or is blocked',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: {
          type: 'string',
          examples: ['This user does not exist', 'This user is blocked'],
        },
      },
    },
  })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieves a list of users with optional filtering.',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: String,
    description: 'Filter by user active status (true/false)',
    example: 'true',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filter by user name',
    example: 'John',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: String,
    description: 'Page number',
    example: '1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: String,
    description: 'Number of items per page',
    example: '10',
  })
  @ApiOkResponse({
    description: 'Users retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Users retrieved successfully' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              email: { type: 'string', format: 'email' },
              name: { type: 'string' },
              user_role: { type: 'string', enum: ['user', 'admin'] },
              isActive: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async findAll(@Query() filterData: UserFilterDto) {
    const users = await this.usersService.findAll(filterData)
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get user by ID',
    description:
      'Retrieves a specific user by ID. Users can only view their own profile unless they are admin.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'User ID',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'User retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            user_role: { type: 'string', enum: ['user', 'admin'] },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Permission denied or user not found',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Block user',
    description: 'Blocks a user account. Only admins can perform this action.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'User ID to block',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'User blocked successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User blocked successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            user_role: { type: 'string', enum: ['user', 'admin'] },
            isActive: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin role required' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update user',
    description:
      'Updates user information. Users can only update their own profile unless they are admin.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'User ID to update',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'User updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User updated successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            user_role: { type: 'string', enum: ['user', 'admin'] },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Permission denied or validation failed',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete user',
    description:
      'Deletes a user account. Users can only delete their own account unless they are admin.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'User ID to delete',
    format: 'uuid',
  })
  @ApiNoContentResponse({
    description: 'User deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User deleted successfully' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Permission denied',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
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
